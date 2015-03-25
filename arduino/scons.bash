#!/bin/bash

spinner(){
	PROC=$1
	while [ -d /proc/$PROC ];do
		echo -ne '.' ; sleep 1 
	done
	echo ''
	return 0
}

dir=${PWD##*/}
if [[ $dir != "arduino" ]] ; then
	echo -e '\e[31;1mExecuter ce script dans le dossier arduino'
	exit 1
fi

cd FlussMittel/asserv/
echo -e '\e[0mBuilding FM asserv'
echo -ne '\e[0;2m'
scons > /dev/null 2> log.tmp &
spinner $!
rc=$?
if [[ $rc != 0 ]] ; then
	cat log.tmp
	echo -e '\e[31;1mFM Asserv failed'
else
	echo -e '\e[32;1mFM Asserv OK'
fi
if [[ $1 == -c ]] ; then
	scons -c > /dev/null &
fi
rm log.tmp

cd ../other/
echo -e '\e[0mBuilding FM other'
echo -ne '\e[0;2m'
scons > /dev/null 2> log.tmp &
spinner $!
rc=$?
if [[ $rc != 0 ]] ; then
	cat log.tmp
	echo -e '\e[31;1mFM Other failed'
else
	echo -e '\e[32;1mFM Other OK'
fi
if [[ $1 == -c ]] ; then
	scons -c > /dev/null &
fi
rm log.tmp

cd ../../Tibot/asserv/
echo -e '\e[0mBuilding Tibot asserv'
echo -ne '\e[0;2m'
scons > /dev/null 2> log.tmp &
spinner $!
rc=$?
if [[ $rc != 0 ]] ; then
	cat log.tmp
	echo -e '\e[31;1mTibot Asserv failed'
else
	echo -e '\e[32;1mTibot Asserv OK'
fi
if [[ $1 == -c ]] ; then
	scons -c > /dev/null &
fi
rm log.tmp

cd ../other/
echo -e '\e[0mBuilding Tibot other'
echo -ne '\e[0;2m'
scons > /dev/null 2> log.tmp &
spinner $!
rc=$?
if [[ $rc != 0 ]] ; then
	cat log.tmp
	echo -e '\e[31;1mTibot Other failed'
else
	echo -e '\e[32;1mTibot Other OK'
fi
if [[ $1 == -c ]] ; then
	scons -c > /dev/null &
fi
rm log.tmp

exit 0
