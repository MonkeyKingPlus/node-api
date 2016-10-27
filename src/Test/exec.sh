#!/bin/bash

mocha $(cd `dirname $0`; pwd)/$1/*.js