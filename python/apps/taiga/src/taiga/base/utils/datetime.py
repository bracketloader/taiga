# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL
#
# The code is partially taken (and modified) from djangorestframework-simplejwt v. 4.7.1
# (https://github.com/jazzband/djangorestframework-simplejwt/tree/5997c1aee8ad5182833d6b6759e44ff0a704edb4)
# that is licensed under the following terms:

from calendar import timegm
from datetime import datetime, time, timezone
from typing import Union

_AnyTime = Union[time, datetime]


def is_aware(value: _AnyTime) -> bool:
    """
    Determines if a given datetime.datetime is aware.

    The concept is defined in Python's docs:
    http://docs.python.org/library/datetime.html#datetime.tzinfo

    Assuming value.tzinfo is either None or a proper datetime.tzinfo,
    value.utcoffset() implements the appropriate logic.
    """
    return value.utcoffset() is not None


def is_naive(value: _AnyTime) -> bool:
    """
    Determines if a given datetime.datetime is naive.

    The concept is defined in Python's docs:
    http://docs.python.org/library/datetime.html#datetime.tzinfo

    Assuming value.tzinfo is either None or a proper datetime.tzinfo,
    value.utcoffset() implements the appropriate logic.
    """
    return value.utcoffset() is None


def aware_utcnow() -> datetime:
    """
    Returns an aware datetime.utcnow()
    """
    return datetime.utcnow().replace(tzinfo=timezone.utc)


def datetime_to_epoch(dt: datetime) -> int:
    """
    Convert a datetime.datetime to its unix time representation.
    """
    return timegm(dt.utctimetuple())


def epoch_to_datetime(ts: int) -> datetime:
    """
    Convert a unix time representation to a datetime.datetime.
    """
    return datetime.fromtimestamp(ts, tz=timezone.utc)