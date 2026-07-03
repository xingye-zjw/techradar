"""
脚本配置模块：统一管理路径和参数
所有脚本应从这里获取路径，避免硬编码
"""
import os
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

DEFAULT_PATHS = {
    'roadmap': os.path.join(PROJECT_DIR, 'lib', 'roadmap-data.ts'),
    'constants': os.path.join(PROJECT_DIR, 'lib', 'constants.ts'),
    'learning_paths': os.path.join(PROJECT_DIR, 'lib', 'learning-paths.ts'),
    'tools': os.path.join(PROJECT_DIR, 'content', 'toolbox', 'tools.json'),
    'intel': os.path.join(PROJECT_DIR, 'content', 'intel'),
    'nodes': os.path.join(PROJECT_DIR, 'content', 'nodes'),
}

def get_arg_parser(description='Roadmap script'):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument('--roadmap', '-r', default=DEFAULT_PATHS['roadmap'],
                        help=f'Roadmap data file path (default: {DEFAULT_PATHS["roadmap"]})')
    parser.add_argument('--constants', '-c', default=DEFAULT_PATHS['constants'],
                        help=f'Constants file path (default: {DEFAULT_PATHS["constants"]})')
    parser.add_argument('--learning-paths', '-p', default=DEFAULT_PATHS['learning_paths'],
                        help=f'Learning paths file path (default: {DEFAULT_PATHS["learning_paths"]})')
    parser.add_argument('--tools', '-t', default=DEFAULT_PATHS['tools'],
                        help=f'Tools JSON file path (default: {DEFAULT_PATHS["tools"]})')
    return parser

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)