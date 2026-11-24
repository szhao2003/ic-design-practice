def latest_by_key(records):
    """Keep the last value per string key, ordered by its last occurrence."""
    latest = {}
    for key, value in records:
        # Reassignment alone would retain the first insertion position.
        if key in latest:
            del latest[key]
        latest[key] = value
    return list(latest.items())
