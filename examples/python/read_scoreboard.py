from collections import defaultdict, deque


def check_reads(requests, responses):
    """Check a completed single-beat trace; IDs may reorder, each ID is FIFO."""
    pending = defaultdict(deque)
    for transaction_id, expected in requests:
        pending[transaction_id].append(expected)

    errors = []
    for transaction_id, actual in responses:
        queue = pending.get(transaction_id)
        if not queue:
            # Unexpected or duplicate response: consume no other ID's request.
            errors.append(("unexpected", transaction_id, actual))
            continue
        expected = queue.popleft()
        # A bad response still consumes this ID's oldest outstanding request.
        if actual != expected:
            errors.append(("mismatch", transaction_id, expected, actual))

    # Dictionaries retain first-ID insertion order; each deque retains FIFO order.
    for transaction_id, queue in pending.items():
        for expected in queue:
            errors.append(("missing", transaction_id, expected))
    return errors
