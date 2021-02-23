docker-compose -f  docker-compose.yaml up --always-recreate-deps -d 
sleep 20 #executing too fast causes some errors 
docker cp ./docker/standalone/fill_user_account.sh qtum:.
docker exec qtum /bin/sh -c ./fill_user_account.sh