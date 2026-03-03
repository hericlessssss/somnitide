#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup batch script, version 3.3.2
# ----------------------------------------------------------------------------

set -e

# OS specific support.
cygwin=false;
darwin=false;
mingw=false
case "$(uname)" in
  CYGWIN*) cygwin=true ;;
  DARWIN*) darwin=true ;;
  MINGW*) mingw=true;;
esac

## Path to the location of the current script
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME
Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java > /dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in PATH.
Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

MAVEN_WRAPPER_JAR=".mvn/wrapper/maven-wrapper.jar"
MAVEN_WRAPPER_PROPERTIES=".mvn/wrapper/maven-wrapper.properties"

BASE_DIR="$(pwd)"

if [ -f "$BASE_DIR/$MAVEN_WRAPPER_PROPERTIES" ]; then
    . "$BASE_DIR/$MAVEN_WRAPPER_PROPERTIES"
fi

WRAPPER_LAUNCHER="org.apache.maven.wrapper.MavenWrapperMain"
DOWNLOAD_URL="${distributionUrl}"

if [ ! -f "$BASE_DIR/$MAVEN_WRAPPER_JAR" ]; then
    if [ -n "$MVNW_REPOURL" ]; then
        wrapperUrl="$MVNW_REPOURL/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
    else
        wrapperUrl="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
    fi
    "$JAVACMD" -classpath "$BASE_DIR/$MAVEN_WRAPPER_JAR" "$WRAPPER_LAUNCHER" \
        "-Dmaven.multiModuleProjectDirectory=$BASE_DIR" \
        "$MAVEN_WRAPPER_PROPERTIES" \
        "$@"
fi

exec "$JAVACMD" \
    $MAVEN_OPTS \
    $MAVEN_DEBUG_OPTS \
    -classpath "$BASE_DIR/$MAVEN_WRAPPER_JAR" \
    "-Dmaven.multiModuleProjectDirectory=$BASE_DIR" \
    "$WRAPPER_LAUNCHER" \
    "$@"
