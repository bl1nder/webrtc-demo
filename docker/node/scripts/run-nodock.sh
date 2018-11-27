#!/bin/bash
SCRIPT="$1"

if [[ ${PROJECT_PATH:0:1} = "/" ]]; then
    export PROJECT_PATH=$PROJECT_PATH
else
    export PROJECT_PATH="/opt/app/"$PROJECT_PATH
fi

cd $PROJECT_PATH
echo 'test1'
if [[ $YARN = true ]]; then
    su -c "cd $PROJECT_PATH; yarn" -s /bin/bash www-app
else
    su -c "cd $PROJECT_PATH; npm i --force" -s /bin/bash www-app
fi
echo 'test2'

chown -R www-app:www-app /opt/app
echo 'test3'

su -c "cd $PROJECT_PATH; $SCRIPT" -s /bin/bash www-app
echo 'test4'