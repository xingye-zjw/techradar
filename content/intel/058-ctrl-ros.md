---
title: 机器人技术与ROS2
category: embedded
difficulty: advanced
duration: 3周
summary: 学习机器人操作系统ROS2的核心概念，掌握导航、定位和控制的实践技能
takeaways: "- 掌握ROS2核心概念和通信机制
  - 理解机器人导航原理
  - 能实现基本的机器人控制
  - 理解多机器人协调"
relatedTools: ["ros2", "ultralytics-yolo", "huggingface-transformers"]
relatedIntel: "- 052-embedded-c
  - 053-embedded-rtos
  - 054-elec-circuit"
relatedNodes: ["electrical-safety", "ctrl-ros"]
tags: "- ros
  - robot
  - navigation
  - slam
  - moveit
  - gazebo
  - sensor"
relatedTerms: ["data-structure", "rtos", "algorithm", "complexity"]
---

## 为什么你要学它

ROS2是机器人领域的标准软件框架。在AI和自动化时代：

- **服务机器人**：酒店送餐、医院配送、家庭服务
- **工业机器人**：协作机器人、AGV/AMR、机械臂
- **自动驾驶**：感知融合、路径规划、车辆控制
- **无人机**：自主飞行、编队控制、任务规划

如果你不会ROS2，就无法进入机器人行业。

## 一句话概览（快速版）

- **节点是进程**：每个功能模块是一个节点，独立运行
- **话题是管道**：发布-订阅模式，适合传感器数据流
- **服务是RPC**：请求-应答模式，适合一次性任务
- **动作是异步任务**：Goal-Feedback-Result，适合长时间任务

## 核心拆解

### 🔑 ROS2节点与通信

```python
# ROS2 Python示例
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class SimpleRobot(Node):
    def __init__(self):
        super().__init__('simple_robot')

        # 创建发布者：发布速度指令
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # 创建订阅者：订阅激光雷达数据
        self.laser_sub = self.create_subscription(
            LaserScan,
            'scan',
            self.laser_callback,
            10
        )

        # 创建定时器：每100ms执行一次
        self.timer = self.create_timer(0.1, self.timer_callback)

        self.get_logger().info('Robot node started')

    def laser_callback(self, msg):
        """处理激光雷达数据"""
        # 获取前方距离
        front_distance = msg.ranges[len(msg.ranges)//2]

        if front_distance < 0.5:  # 前方有障碍物
            self.get_logger().warn(f'Obstacle detected: {front_distance:.2f}m')
            self.stop()
        else:
            self.move_forward()

    def timer_callback(self):
        """定时任务"""
        pass

    def move_forward(self):
        """前进"""
        cmd = Twist()
        cmd.linear.x = 0.2  # 0.2 m/s
        cmd.angular.z = 0.0
        self.cmd_vel_pub.publish(cmd)

    def stop(self):
        """停止"""
        cmd = Twist()
        cmd.linear.x = 0.0
        cmd.angular.z = 0.0
        self.cmd_vel_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    robot = SimpleRobot()
    rclpy.spin(robot)
    robot.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 🔑 导航堆栈

```python
# Navigation2使用示例
# 通常通过命令行或行为树（Behavior Tree）使用

# 1. 发布导航目标
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from nav2_simple_commander.robot_navigator import BasicNavigator

class Navigator(Node):
    def __init__(self):
        super().__init__('navigator')
        self.nav = BasicNavigator()

    def navigate_to_pose(self, x, y, theta):
        """导航到指定位置"""
        goal_pose = PoseStamped()
        goal_pose.header.frame_id = 'map'
        goal_pose.header.stamp = self.get_clock().now().to_msg()
        goal_pose.pose.position.x = x
        goal_pose.pose.position.y = y
        goal_pose.pose.orientation.z = np.sin(theta/2)
        goal_pose.pose.orientation.w = np.cos(theta/2)

        self.nav.goToPose(goal_pose)

        # 等待完成
        while not self.nav.isTaskComplete():
            feedback = self.nav.getFeedback()
            if feedback:
                self.get_logger().info(
                    f'Estimated time: {feedback.estimated_time_remaining:.2f}s'
                )

        result = self.nav.getResult()
        self.get_logger().info(f'Navigation result: {result}')

# 2. 路径规划算法对比
"""
全局路径规划器：
- NavFn: Dijkstra算法，保证最短路径
- SmacPlanner: A*算法，支持任意形状机器人
- Theta*: 考虑转向代价，路径更平滑

局部路径规划器：
- DWB: 动态窗口法，考虑速度和加速度约束
- TEB: 时间弹性带，考虑时间最优
- MPPI: 模型预测路径积分，考虑动力学约束
"""
```

### 🔑 SLAM建图

```python
# SLAM Toolbox使用
# 通常通过launch文件启动

"""
# 启动SLAM
ros2 launch slam_toolbox online_sync_launch.py

# 保存地图
ros2 service call /slam_toolbox/save_map nav2_msgs/srv/SaveMap \
    "{map_url: {data: '/home/user/map.yaml'}}"

# 加载地图导航
ros2 launch nav2_bringup bringup_launch.py map:=/home/user/map.yaml
"""

# 地图格式解析
import yaml
import numpy as np
from PIL import Image

def load_map(map_yaml_path):
    """加载占据栅格地图"""
    with open(map_yaml_path, 'r') as f:
        map_info = yaml.safe_load(f)

    # 加载PGM图像
    map_image = Image.open(map_info['image'])
    map_data = np.array(map_image)

    # 转换占据概率
    # 0: 空闲, 255: 占据, 205: 未知
    occupancy = np.zeros_like(map_data, dtype=float)
    occupancy[map_data == 0] = 0.0      # 空闲
    occupancy[map_data == 255] = 1.0    # 占据
    occupancy[map_data == 205] = -1.0   # 未知

    return occupancy, map_info

# 可视化地图
def visualize_map(occupancy, map_info):
    import matplotlib.pyplot as plt

    resolution = map_info['resolution']
    origin = map_info['origin']

    plt.figure(figsize=(10, 10))
    plt.imshow(occupancy, cmap='gray', origin='lower',
               extent=[origin[0],
                       origin[0] + occupancy.shape[1] * resolution,
                       origin[1],
                       origin[1] + occupancy.shape[0] * resolution])
    plt.colorbar(label='Occupancy')
    plt.xlabel('X (m)')
    plt.ylabel('Y (m)')
    plt.title('Occupancy Grid Map')
    plt.savefig('map_visualization.png')
```

### 🔑 机械臂控制

```python
# MoveIt2 Python接口
import rclpy
from rclpy.node import Node
from moveit.planning import MoveItPy
from geometry_msgs.msg import Pose

class ArmController(Node):
    def __init__(self):
        super().__init__('arm_controller')

        # 初始化MoveIt
        self.moveit = MoveItPy(node_name="moveit_py")
        self.arm = self.moveit.get_planning_component("panda_arm")

    def move_to_pose(self, x, y, z, roll, pitch, yaw):
        """移动到指定姿态"""
        # 设置目标姿态
        target_pose = Pose()
        target_pose.position.x = x
        target_pose.position.y = y
        target_pose.position.z = z

        # 欧拉角转四元数
        from scipy.spatial.transform import Rotation as R
        quat = R.from_euler('xyz', [roll, pitch, yaw]).as_quat()
        target_pose.orientation.x = quat[0]
        target_pose.orientation.y = quat[1]
        target_pose.orientation.z = quat[2]
        target_pose.orientation.w = quat[3]

        # 规划
        self.arm.set_start_state_to_current_state()
        self.arm.set_goal_state(pose_stamped_msg=target_pose, pose_link="panda_link8")

        # 执行
        plan_result = self.arm.plan()
        if plan_result:
            self.moveit.execute(plan_result.trajectory, controllers=[])
            self.get_logger().info('Motion executed successfully')
        else:
            self.get_logger().error('Planning failed')

    def move_joint(self, joint_positions):
        """移动到指定关节角度"""
        self.arm.set_start_state_to_current_state()
        self.arm.set_goal_state(joint_positions=joint_positions)

        plan_result = self.arm.plan()
        if plan_result:
            self.moveit.execute(plan_result.trajectory, controllers=[])
```

## 完整跑通方案

**第一步：安装ROS2**

```bash
# Ubuntu 22.04
sudo apt update && sudo apt install -y curl gnupg lsb-release
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install -y ros-humble-desktop

# 设置环境
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc

# 安装开发工具
sudo apt install -y python3-colcon-common-extensions python3-rosdep
sudo rosdep init
rosdep update
```

**第二步：创建工作空间和包**

```bash
# 创建工作空间
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src

# 创建包
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_robot --dependencies rclpy std_msgs geometry_msgs

# 编写节点
cat > ~/ros2_ws/src/my_robot/my_robot/simple_robot.py << 'EOF'
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class Robot(Node):
    def __init__(self):
        super().__init__('robot')
        self.pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        msg = Twist()
        msg.linear.x = 0.5
        self.pub.publish(msg)
        self.get_logger().info('Publishing velocity')

def main():
    rclpy.init()
    robot = Robot()
    rclpy.spin(robot)
    robot.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
EOF

# 构建
cd ~/ros2_ws
colcon build --packages-select my_robot
source install/setup.bash

# 运行
ros2 run my_robot simple_robot
```

**第三步：仿真环境**

```bash
# 安装TurtleBot3仿真
sudo apt install -y ros-humble-turtlebot3-gazebo

# 设置模型
export TURTLEBOT3_MODEL=burger

# 启动仿真
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# 启动导航
ros2 launch turtlebot3_navigation2 navigation2.launch.py map:=map.yaml

# 发送导航目标
ros2 topic pub /goal_pose geometry_msgs/PoseStamped \
    "{header: {frame_id: 'map'}, pose: {position: {x: 1.0, y: 1.0, z: 0.0}, orientation: {w: 1.0}}}"
```

## 常见误区

**误区 1：忽视坐标系转换 → 导航失败**

解释：ROS2中所有位姿都有参考坐标系（frame_id）。导航时目标必须在map坐标系下，传感器数据在sensor坐标系下。必须使用TF2进行坐标变换。

**误区 2：话题名不匹配 → 节点间无法通信**

解释：发布者和订阅者的话题名必须完全一致，包括命名空间。使用`ros2 topic list`查看可用话题，使用`ros2 topic info`查看发布/订阅关系。

**误区 3：QoS设置不当 → 消息丢失或延迟**

解释：ROS2使用DDS的QoS（服务质量）策略。传感器数据用Best Effort，命令用Reliable。QoS不兼容的发布者和订阅者无法通信。

**误区 4：忽视实时性 → 控制周期不稳定**

解释：ROS2默认不是实时系统。对于需要严格实时性的控制任务，应使用ROS2的实时功能或结合实时操作系统（如Xenomai）。

**误区 5：单节点做所有事 → 系统耦合严重**

解释：ROS2鼓励模块化设计，每个节点只做一件事。感知、规划、控制应分开，通过话题通信。这样便于测试、复用和维护。
