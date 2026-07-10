---
title: 嵌入式驱动开发
category: embedded
difficulty: intermediate
duration: 3-4周
summary: 理解Linux驱动开发的核心原理。掌握字符设备驱动、设备树、中断处理等关键技能。
takeaways:
  - 理解Linux内核模块开发
  - 掌握字符设备驱动编写
  - 理解设备树的使用方法
  - 掌握中断和DMA处理
relatedIntel:
  - 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit
relatedNodes:
  - "embedded-driver"
  - "electrical-safety"
tags:
  - 嵌入式驱动
  - Linux驱动
  - 字符设备
  - 设备树
  - 中断处理
  - 内核模块
relatedTerms:
  - "data-structure"
  - "rtos"
  - "algorithm"
  - "complexity"
relatedTools:
  - "huggingface-transformers"
  - "ultralytics-yolo"
  - "pytorch"
---

## 为什么你要学它

在嵌入式Linux开发中，驱动是连接硬件与应用的桥梁：

- **硬件抽象层**：驱动将复杂的硬件操作封装成标准接口，应用层无需关心底层细节
- **产品化必备**：从原型到产品，必须开发稳定可靠的驱动程序
- **职业竞争力**：驱动工程师是嵌入式领域的高薪岗位，掌握驱动开发能力意味着核心竞争力
- **深入理解系统**：学习驱动开发能让你真正理解Linux内核工作原理

如果你只会应用层开发，遇到硬件问题时束手无策；如果你不懂驱动，就无法实现真正的系统集成。

## 一句话概览（快速版）

- **内核模块是载体**：驱动以内核模块形式加载，`insmod`加载，`rmmod`卸载
- **字符设备是入口**：通过`register_chrdev`注册，用户空间通过`/dev/xxx`访问
- **设备树是配置**：用DTS描述硬件信息，内核解析后驱动获取资源
- **中断是核心机制**：硬件事件通过中断通知驱动，ISR中快速响应，延迟处理放到底半部

## 核心拆解

### 🔑 内核模块基础

```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

// 模块信息
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A simple kernel module");
MODULE_VERSION("1.0");

// 模块参数
static int param_value = 100;
module_param(param_value, int, 0644);
MODULE_PARM_DESC(param_value, "An integer parameter");

// 初始化函数
static int __init hello_init(void)
{
    printk(KERN_INFO "Hello module loaded, param=%d\n", param_value);
    return 0;  // 返回0表示成功
}

// 清理函数
static void __exit hello_exit(void)
{
    printk(KERN_INFO "Goodbye module unloaded\n");
}

// 注册模块入口和出口
module_init(hello_init);
module_exit(hello_exit);
```

**Makefile示例：**

```makefile
# Makefile for kernel module

# 内核源码路径（根据实际环境修改）
KDIR := /lib/modules/$(shell uname -r)/build
PWD := $(shell pwd)

# 模块名称
obj-m := hello.o

# 多文件模块
# obj-m := mydriver.o
# mydriver-objs := main.o gpio.o irq.o

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean

install:
	insmod hello.ko

uninstall:
	rmmod hello

.PHONY: all clean install uninstall
```

### 🔑 字符设备驱动

```c
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "mychar"
#define BUF_LEN 1024

// 设备结构体
struct mychar_dev {
    struct cdev cdev;
    struct class *class;
    struct device *device;
    dev_t dev_num;
    char buffer[BUF_LEN];
    int buffer_len;
    struct mutex lock;  // 互斥锁保护并发访问
};

static struct mychar_dev mydev;

// 打开设备
static int mychar_open(struct inode *inode, struct file *filp)
{
    struct mychar_dev *dev;

    // 获取设备结构体指针
    dev = container_of(inode->i_cdev, struct mychar_dev, cdev);
    filp->private_data = dev;

    pr_info("mychar: device opened\n");
    return 0;
}

// 释放设备
static int mychar_release(struct inode *inode, struct file *filp)
{
    pr_info("mychar: device closed\n");
    return 0;
}

// 读取设备
static ssize_t mychar_read(struct file *filp, char __user *buf,
                           size_t count, loff_t *f_pos)
{
    struct mychar_dev *dev = filp->private_data;
    ssize_t retval;

    if (mutex_lock_interruptible(&dev->lock))
        return -ERESTARTSYS;

    if (*f_pos >= dev->buffer_len) {
        retval = 0;  // EOF
        goto out;
    }

    if (*f_pos + count > dev->buffer_len)
        count = dev->buffer_len - *f_pos;

    // 拷贝数据到用户空间
    if (copy_to_user(buf, dev->buffer + *f_pos, count)) {
        retval = -EFAULT;
        goto out;
    }

    *f_pos += count;
    retval = count;

out:
    mutex_unlock(&dev->lock);
    return retval;
}

// 写入设备
static ssize_t mychar_write(struct file *filp, const char __user *buf,
                            size_t count, loff_t *f_pos)
{
    struct mychar_dev *dev = filp->private_data;
    ssize_t retval;

    if (mutex_lock_interruptible(&dev->lock))
        return -ERESTARTSYS;

    if (*f_pos >= BUF_LEN) {
        retval = -ENOSPC;
        goto out;
    }

    if (*f_pos + count > BUF_LEN)
        count = BUF_LEN - *f_pos;

    // 从用户空间拷贝数据
    if (copy_from_user(dev->buffer + *f_pos, buf, count)) {
        retval = -EFAULT;
        goto out;
    }

    *f_pos += count;
    if (dev->buffer_len < *f_pos)
        dev->buffer_len = *f_pos;

    retval = count;

out:
    mutex_unlock(&dev->lock);
    return retval;
}

// 文件操作结构体
static const struct file_operations mychar_fops = {
    .owner = THIS_MODULE,
    .open = mychar_open,
    .release = mychar_release,
    .read = mychar_read,
    .write = mychar_write,
};

// 模块初始化
static int __init mychar_init(void)
{
    dev_t dev;
    int ret;

    // 初始化互斥锁
    mutex_init(&mydev.lock);

    // 动态分配设备号
    ret = alloc_chrdev_region(&dev, 0, 1, DEVICE_NAME);
    if (ret < 0) {
        pr_err("mychar: failed to allocate device number\n");
        return ret;
    }
    mydev.dev_num = dev;

    // 初始化cdev
    cdev_init(&mydev.cdev, &mychar_fops);
    mydev.cdev.owner = THIS_MODULE;

    // 添加cdev到内核
    ret = cdev_add(&mydev.cdev, dev, 1);
    if (ret < 0) {
        pr_err("mychar: failed to add cdev\n");
        goto fail_cdev;
    }

    // 创建设备类和设备节点
    mydev.class = class_create(THIS_MODULE, DEVICE_NAME);
    if (IS_ERR(mydev.class)) {
        ret = PTR_ERR(mydev.class);
        pr_err("mychar: failed to create class\n");
        goto fail_class;
    }

    mydev.device = device_create(mydev.class, NULL, dev, NULL, DEVICE_NAME);
    if (IS_ERR(mydev.device)) {
        ret = PTR_ERR(mydev.device);
        pr_err("mychar: failed to create device\n");
        goto fail_device;
    }

    pr_info("mychar: device registered, major=%d, minor=%d\n",
            MAJOR(dev), MINOR(dev));
    return 0;

fail_device:
    class_destroy(mydev.class);
fail_class:
    cdev_del(&mydev.cdev);
fail_cdev:
    unregister_chrdev_region(dev, 1);
    return ret;
}

// 模块清理
static void __exit mychar_exit(void)
{
    device_destroy(mydev.class, mydev.dev_num);
    class_destroy(mydev.class);
    cdev_del(&mydev.cdev);
    unregister_chrdev_region(mydev.dev_num, 1);
    pr_info("mychar: device unregistered\n");
}

module_init(mychar_init);
module_exit(mychar_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Driver Developer");
MODULE_DESCRIPTION("Character device driver example");
```

### 🔑 设备树

**设备树源文件（.dts）：**

```dts
// myboard.dts - 自定义设备树
/dts-v1/;

/ {
    model = "My Custom Board";
    compatible = "myvendor,myboard";

    // 定义自己的设备节点
    myleds {
        compatible = "myvendor,myleds";
        #address-cells = <1>;
        #size-cells = <0>;

        led0 {
            label = "heartbeat";
            gpios = <&gpio0 5 GPIO_ACTIVE_LOW>;
            default-state = "on";
        };

        led1 {
            label = "status";
            gpios = <&gpio0 6 GPIO_ACTIVE_LOW>;
            default-state = "off";
        };
    };

    // 自定义GPIO控制器
    mygpio: mygpio@10000000 {
        compatible = "myvendor,mygpio";
        reg = <0x10000000 0x1000>;
        interrupts = <0 42 4>;  // 中断号、触发类型
        interrupt-parent = <&gic>;
        gpio-controller;
        #gpio-cells = <2>;
        interrupt-controller;
        #interrupt-cells = <2>;
    };

    // SPI设备
    myspi: spi@10010000 {
        compatible = "myvendor,myspi";
        reg = <0x10010000 0x1000>;
        interrupts = <0 43 4>;
        clocks = <&clk_spi>;
        clock-names = "spi_clk";
        #address-cells = <1>;
        #size-cells = <0>;

        // SPI从设备
        spidev@0 {
            compatible = "myvendor,spidev";
            reg = <0>;  // CS引脚
            spi-max-frequency = <10000000>;
        };
    };
};
```

**驱动中解析设备树：**

```c
#include <linux/of.h>
#include <linux/of_gpio.h>
#include <linux/gpio.h>

static int myled_probe(struct platform_device *pdev)
{
    struct device *dev = &pdev->dev;
    struct device_node *np = dev->of_node;
    int led_gpio, ret;

    // 方法1：获取GPIO编号
    led_gpio = of_get_named_gpio(np, "led-gpio", 0);
    if (!gpio_is_valid(led_gpio)) {
        dev_err(dev, "Failed to get led-gpio\n");
        return -EINVAL;
    }

    // 申请GPIO
    ret = devm_gpio_request(dev, led_gpio, "led");
    if (ret) {
        dev_err(dev, "Failed to request gpio\n");
        return ret;
    }

    // 设置GPIO方向和初始值
    gpio_direction_output(led_gpio, 1);

    // 方法2：获取属性值
    u32 reg_val;
    ret = of_property_read_u32(np, "reg", &reg_val);
    if (ret)
        dev_warn(dev, "reg property not found\n");

    // 方法3：获取字符串属性
    const char *label;
    ret = of_property_read_string(np, "label", &label);
    if (ret)
        label = "default";

    // 方法4：获取数组属性
    u32 pins[4];
    int count = of_property_count_u32_elems(np, "pins");
    if (count > 0 && count <= 4) {
        of_property_read_u32_array(np, "pins", pins, count);
    }

    dev_info(dev, "LED probed, gpio=%d, label=%s\n", led_gpio, label);
    return 0;
}

// 设备树匹配表
static const struct of_device_id myled_of_match[] = {
    { .compatible = "myvendor,myleds" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, myled_of_match);

// 平台驱动
static struct platform_driver myled_driver = {
    .probe = myled_probe,
    .remove = myled_remove,
    .driver = {
        .name = "myled",
        .of_match_table = myled_of_match,
    },
};

module_platform_driver(myled_driver);
```

### 🔑 中断处理

```c
#include <linux/interrupt.h>
#include <linux/gpio.h>
#include <linux/workqueue.h>

#define GPIO_IRQ_PIN 17

// 设备结构体
struct myirq_dev {
    int irq_num;
    struct work_struct work;      // 工作队列
    struct tasklet_struct tasklet; // tasklet
    spinlock_t lock;               // 自旋锁
    int event_count;
};

static struct myirq_dev mydev;

// 底半部：工作队列处理函数（进程上下文，可以睡眠）
static void my_work_handler(struct work_struct *work)
{
    struct myirq_dev *dev = container_of(work, struct myirq_dev, work);

    // 可以执行耗时操作，如I/O、内存分配等
    pr_info("myirq: workqueue processing, count=%d\n", dev->event_count);

    // 模拟耗时操作
    msleep(100);

    pr_info("myirq: workqueue done\n");
}

// 底半部：tasklet处理函数（原子上下文，不能睡眠）
static void my_tasklet_handler(unsigned long data)
{
    struct myirq_dev *dev = (struct myirq_dev *)data;

    // 只能执行快速操作，不能睡眠
    pr_info("myirq: tasklet processing, count=%d\n", dev->event_count);
}

// 顶半部：中断处理函数（ISR）
static irqreturn_t my_irq_handler(int irq, void *dev_id)
{
    struct myirq_dev *dev = dev_id;
    unsigned long flags;

    // 快速响应，清除中断标志
    // 注意：ISR中不能睡眠！

    // 使用自旋锁保护共享数据
    spin_lock_irqsave(&dev->lock, flags);
    dev->event_count++;
    spin_unlock_irqrestore(&dev->lock, flags);

    pr_info("myirq: interrupt occurred, irq=%d, count=%d\n",
            irq, dev->event_count);

    // 调度底半部处理
    // 方式1：工作队列（推荐用于耗时操作）
    schedule_work(&dev->work);

    // 方式2：tasklet（用于快速操作）
    // tasklet_schedule(&dev->tasklet);

    return IRQ_HANDLED;
}

// 初始化中断
static int myirq_init(void)
{
    int ret;

    // 初始化锁
    spin_lock_init(&mydev.lock);

    // 初始化工作队列
    INIT_WORK(&mydev.work, my_work_handler);

    // 初始化tasklet
    tasklet_init(&mydev.tasklet, my_tasklet_handler, (unsigned long)&mydev);

    // 申请GPIO
    ret = gpio_request(GPIO_IRQ_PIN, "myirq");
    if (ret) {
        pr_err("myirq: failed to request gpio\n");
        return ret;
    }

    // 设置GPIO为输入
    gpio_direction_input(GPIO_IRQ_PIN);

    // 获取中断号
    mydev.irq_num = gpio_to_irq(GPIO_IRQ_PIN);
    if (mydev.irq_num < 0) {
        pr_err("myirq: failed to get irq number\n");
        ret = mydev.irq_num;
        goto fail_gpio;
    }

    // 申请中断
    // IRQF_TRIGGER_RISING: 上升沿触发
    // IRQF_TRIGGER_FALLING: 下降沿触发
    // IRQF_SHARED: 共享中断
    ret = request_irq(mydev.irq_num, my_irq_handler,
                      IRQF_TRIGGER_RISING | IRQF_TRIGGER_FALLING,
                      "myirq", &mydev);
    if (ret) {
        pr_err("myirq: failed to request irq\n");
        goto fail_gpio;
    }

    pr_info("myirq: initialized, irq=%d\n", mydev.irq_num);
    return 0;

fail_gpio:
    gpio_free(GPIO_IRQ_PIN);
    return ret;
}

// 清理中断
static void myirq_exit(void)
{
    // 释放中断
    free_irq(mydev.irq_num, &mydev);

    // 释放GPIO
    gpio_free(GPIO_IRQ_PIN);

    // 取消工作队列
    cancel_work_sync(&mydev.work);

    // 禁用tasklet
    tasklet_kill(&mydev.tasklet);

    pr_info("myirq: cleaned up\n");
}

module_init(myirq_init);
module_exit(myirq_exit);

MODULE_LICENSE("GPL");
```

### 🔑 调试方法

```c
#include <linux/module.h>
#include <linux/debugfs.h>
#include <linux/seq_file.h>

// 调试相关全局变量
static struct dentry *debug_dir;
static int debug_value = 0;

// printk日志级别
// KERN_EMERG   : 系统不可用
// KERN_ALERT   : 必须立即处理
// KERN_CRIT    : 严重错误
// KERN_ERR     : 错误
// KERN_WARNING : 警告
// KERN_NOTICE  : 正常但重要
// KERN_INFO    : 信息
// KERN_DEBUG   : 调试信息

// 使用pr_xxx宏（推荐）
static void demo_printk(void)
{
    pr_emerg("Emergency message\n");
    pr_alert("Alert message\n");
    pr_crit("Critical message\n");
    pr_err("Error message\n");
    pr_warn("Warning message\n");
    pr_notice("Notice message\n");
    pr_info("Info message\n");
    pr_debug("Debug message (only if DEBUG defined)\n");

    // 动态调试
    pr_debug("Dynamic debug: value=%d\n", debug_value);
}

// debugfs接口
static int debug_show(struct seq_file *s, void *v)
{
    seq_printf(s, "Debug value: %d\n", debug_value);
    seq_printf(s, "Module: %s\n", THIS_MODULE->name);
    return 0;
}

static int debug_open(struct inode *inode, struct file *file)
{
    return single_open(file, debug_show, NULL);
}

static ssize_t debug_write(struct file *file, const char __user *buf,
                           size_t count, loff_t *ppos)
{
    char kbuf[32];
    int value;

    if (count >= sizeof(kbuf))
        return -EINVAL;

    if (copy_from_user(kbuf, buf, count))
        return -EFAULT;

    kbuf[count] = '\0';
    if (kstrtoint(kbuf, 10, &value))
        return -EINVAL;

    debug_value = value;
    pr_info("debug: value set to %d\n", value);

    return count;
}

static const struct file_operations debug_fops = {
    .owner = THIS_MODULE,
    .open = debug_open,
    .read = seq_read,
    .write = debug_write,
    .llseek = seq_lseek,
    .release = single_release,
};

// 初始化debugfs
static int init_debug(void)
{
    // 创建debugfs目录
    debug_dir = debugfs_create_dir("mydriver", NULL);
    if (!debug_dir) {
        pr_err("Failed to create debugfs directory\n");
        return -ENOMEM;
    }

    // 创建调试文件
    debugfs_create_file("debug", 0644, debug_dir, NULL, &debug_fops);

    // 创建简单变量
    debugfs_create_u32("value", 0644, debug_dir, &debug_value);

    pr_info("debugfs initialized at /sys/kernel/debug/mydriver/\n");
    return 0;
}

// 清理debugfs
static void cleanup_debug(void)
{
    debugfs_remove_recursive(debug_dir);
}
```

**调试命令：**

```bash
# 查看内核日志
dmesg | tail -20
dmesg -w  # 实时查看

# 设置日志级别
echo "8 4 1 7" > /proc/sys/kernel/printk

# 动态调试
echo "module mydriver +p" > /sys/kernel/debug/dynamic_debug/control
echo "module mydriver -p" > /sys/kernel/debug/dynamic_debug/control

# 查看设备树
ls /sys/firmware/devicetree/base/
cat /sys/firmware/devicetree/base/myleds/compatible

# 查看设备信息
cat /proc/devices
ls -la /dev/mychar
cat /sys/class/mychar/mychar/dev

# 查看中断信息
cat /proc/interrupts

# 查看内存使用
cat /proc/slabinfo
cat /sys/kernel/slab/kmalloc-64/objects  # 查看特定slab

# 使用strace跟踪用户态程序
strace -o trace.log ./test_app

# 使用ftrace跟踪内核函数
echo function > /sys/kernel/debug/tracing/current_tracer
echo mychar_read > /sys/kernel/debug/tracing/set_ftrace_filter
cat /sys/kernel/debug/tracing/trace
```

## 完整跑通方案

**第一步：搭建开发环境**

```bash
# 安装开发工具
sudo apt update
sudo apt install build-essential linux-headers-$(uname -r)

# 创建项目目录
mkdir -p ~/driver_dev && cd ~/driver_dev

# 验证内核头文件
ls /lib/modules/$(uname -r)/build
```

**第二步：编写测试模块**

```c
// hello.c - 最简单的内核模块
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

static int __init hello_init(void)
{
    pr_info("Hello Kernel!\n");
    return 0;
}

static void __exit hello_exit(void)
{
    pr_info("Goodbye Kernel!\n");
}

module_init(hello_init);
module_exit(hello_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Developer");
MODULE_DESCRIPTION("Simple hello module");
```

```makefile
# Makefile
KDIR := /lib/modules/$(shell uname -r)/build
PWD := $(shell pwd)

obj-m := hello.o

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
```

```bash
# 编译
make

# 加载模块
sudo insmod hello.ko

# 查看日志
dmesg | tail

# 查看已加载模块
lsmod | grep hello

# 卸载模块
sudo rmmod hello
```

**第三步：编写完整字符设备驱动**

```c
// mychar.c - 完整字符设备驱动
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "mychar"
#define BUF_LEN 1024

static dev_t dev_num;
static struct cdev my_cdev;
static struct class *my_class;
static struct device *my_device;
static char device_buffer[BUF_LEN];
static DEFINE_MUTEX(my_mutex);

static int my_open(struct inode *inode, struct file *filp)
{
    pr_info("mychar: opened\n");
    return 0;
}

static int my_release(struct inode *inode, struct file *filp)
{
    pr_info("mychar: closed\n");
    return 0;
}

static ssize_t my_read(struct file *filp, char __user *buf,
                       size_t count, loff_t *f_pos)
{
    ssize_t ret;

    if (mutex_lock_interruptible(&my_mutex))
        return -ERESTARTSYS;

    if (*f_pos >= BUF_LEN) {
        ret = 0;
        goto out;
    }

    if (*f_pos + count > BUF_LEN)
        count = BUF_LEN - *f_pos;

    if (copy_to_user(buf, device_buffer + *f_pos, count)) {
        ret = -EFAULT;
        goto out;
    }

    *f_pos += count;
    ret = count;

out:
    mutex_unlock(&my_mutex);
    return ret;
}

static ssize_t my_write(struct file *filp, const char __user *buf,
                        size_t count, loff_t *f_pos)
{
    ssize_t ret;

    if (mutex_lock_interruptible(&my_mutex))
        return -ERESTARTSYS;

    if (*f_pos >= BUF_LEN) {
        ret = -ENOSPC;
        goto out;
    }

    if (*f_pos + count > BUF_LEN)
        count = BUF_LEN - *f_pos;

    if (copy_from_user(device_buffer + *f_pos, buf, count)) {
        ret = -EFAULT;
        goto out;
    }

    *f_pos += count;
    ret = count;

out:
    mutex_unlock(&my_mutex);
    return ret;
}

static const struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_open,
    .release = my_release,
    .read = my_read,
    .write = my_write,
};

static int __init my_init(void)
{
    int ret;

    ret = alloc_chrdev_region(&dev_num, 0, 1, DEVICE_NAME);
    if (ret < 0)
        return ret;

    cdev_init(&my_cdev, &my_fops);
    my_cdev.owner = THIS_MODULE;

    ret = cdev_add(&my_cdev, dev_num, 1);
    if (ret < 0)
        goto fail_cdev;

    my_class = class_create(THIS_MODULE, DEVICE_NAME);
    if (IS_ERR(my_class)) {
        ret = PTR_ERR(my_class);
        goto fail_class;
    }

    my_device = device_create(my_class, NULL, dev_num, NULL, DEVICE_NAME);
    if (IS_ERR(my_device)) {
        ret = PTR_ERR(my_device);
        goto fail_device;
    }

    pr_info("mychar: registered major=%d minor=%d\n",
            MAJOR(dev_num), MINOR(dev_num));
    return 0;

fail_device:
    class_destroy(my_class);
fail_class:
    cdev_del(&my_cdev);
fail_cdev:
    unregister_chrdev_region(dev_num, 1);
    return ret;
}

static void __exit my_exit(void)
{
    device_destroy(my_class, dev_num);
    class_destroy(my_class);
    cdev_del(&my_cdev);
    unregister_chrdev_region(dev_num, 1);
    pr_info("mychar: unregistered\n");
}

module_init(my_init);
module_exit(my_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Driver Developer");
MODULE_DESCRIPTION("Character device driver");
```

**第四步：编写用户态测试程序**

```c
// test_app.c - 用户态测试程序
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>

#define DEVICE_PATH "/dev/mychar"
#define BUF_SIZE 256

int main(void)
{
    int fd;
    char write_buf[BUF_SIZE];
    char read_buf[BUF_SIZE];
    ssize_t ret;

    // 打开设备
    fd = open(DEVICE_PATH, O_RDWR);
    if (fd < 0) {
        perror("Failed to open device");
        return EXIT_FAILURE;
    }

    printf("Device opened successfully\n");

    // 写入数据（使用 snprintf 避免缓冲区溢出）
    snprintf(write_buf, sizeof(write_buf), "Hello from user space!");
    ret = write(fd, write_buf, strlen(write_buf));
    if (ret < 0) {
        perror("Write failed");
        close(fd);
        return EXIT_FAILURE;
    }
    printf("Wrote %zd bytes: %s\n", ret, write_buf);

    // 移动文件指针到开头
    lseek(fd, 0, SEEK_SET);

    // 读取数据
    memset(read_buf, 0, BUF_SIZE);
    ret = read(fd, read_buf, BUF_SIZE - 1);
    if (ret < 0) {
        perror("Read failed");
        close(fd);
        return EXIT_FAILURE;
    }
    printf("Read %zd bytes: %s\n", ret, read_buf);

    // 关闭设备
    close(fd);
    printf("Device closed\n");

    return EXIT_SUCCESS;
}
```

```bash
# 编译驱动
make

# 编译测试程序
gcc -o test_app test_app.c

# 加载驱动
sudo insmod mychar.ko

# 查看设备
ls -la /dev/mychar
cat /proc/devices | grep mychar

# 运行测试
sudo ./test_app

# 查看日志
dmesg | tail

# 卸载驱动
sudo rmmod mychar
```

## 常见误区

**误区 1：在内核代码中使用用户空间函数 → 编译错误或崩溃**

解释：内核代码不能使用标准C库函数（如printf、malloc等）。应使用内核提供的对应函数：printk代替printf，kmalloc代替malloc，copy_to_user/copy_from_user进行用户空间数据访问。

**误区 2：在中断处理函数中睡眠 → 系统死锁**

解释：ISR运行在中断上下文，不能睡眠。不能使用可能阻塞的函数（如kmalloc带GFP_KERNEL、mutex_lock、msleep等）。应使用自旋锁、tasklet或工作队列延迟处理。

**误区 3：忘记检查copy_to_user/copy_from_user返回值 → 数据损坏**

解释：这两个函数可能失败，必须检查返回值。返回非零值表示拷贝失败，应返回-EFAULT。

**误区 4：设备树compatible字符串不匹配 → 驱动无法加载**

解释：设备树中的compatible属性必须与驱动中的of_device_table完全匹配，包括大小写。建议使用"vendor,device"格式。

**误区 5：忽视并发访问保护 → 数据竞争**

解释：多个进程可能同时打开设备，必须使用互斥锁或自旋锁保护共享数据。互斥锁可以睡眠，适用于进程上下文；自旋锁不能睡眠，适用于中断上下文。

## 学习资源推荐

**官方文档**

- Linux内核文档：https://www.kernel.org/doc/html/latest/driver-api/
- 设备树规范：https://www.devicetree.org/

**经典书籍**

- 《Linux设备驱动程序》(Linux Device Drivers 3) - Jonathan Corbet
- 《深入Linux内核架构》 - Wolfgang Mauerer
- 《Linux内核设计与实现》 - Robert Love

**在线资源**

- Linux内核源码：https://github.com/torvalds/linux
- 驱动示例：drivers/char/ 目录下的源码
- Bootlin培训资料：https://bootlin.com/training/

**开发板推荐**

- 树莓派4B：适合入门，社区资源丰富
- BeagleBone Black：适合学习硬件接口
- STM32MP157：官方支持Linux，适合工业应用

**调试工具**

- dmesg：查看内核日志
- strace：跟踪系统调用
- ftrace：内核函数跟踪
- debugfs：调试文件系统
- kgdb：内核调试器
