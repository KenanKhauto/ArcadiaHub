"""Utility helpers used across the application."""

import random
import string
from typing import List


def generate_room_code(length: int = 6) -> str:
    """
    Generate a random uppercase room code.

    Args:
        length: The desired room code length.

    Returns:
        A random uppercase string.
    """
    return "".join(random.choices(string.ascii_uppercase, k=length))


def choose_random_players(player_ids: List[str], count: int) -> List[str]:
    """
    Randomly select players.

    Args:
        player_ids: List of player IDs.
        count: Number of players to choose.

    Returns:
        Random subset of player IDs.
    """
    return random.sample(player_ids, count)