import os
import random
from string import ascii_letters, digits
from chess import svg
import xml.etree.ElementTree as ET
from xml.dom import minidom


SVG_FILE_PATH = "./assets/chess_board.svg"


def save_board(board):
    svg_string = svg.board(board)
    svg_root = ET.fromstring(svg_string)
    xml_string = minidom.parseString(ET.tostring(svg_root)).toprettyxml(indent="  ")

    with open(SVG_FILE_PATH, "w") as f:
        f.write(xml_string)


def generate_random_id(length: int=20) -> str:
    return ''.join(random.choices(list(ascii_letters + digits), k=length))
