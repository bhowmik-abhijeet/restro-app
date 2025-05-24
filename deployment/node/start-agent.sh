#!/bin/bash
# This is exclusively for WSL. You can extend this for your env
source .env
regions=("us" "eu" "ap" "sa" "ca" "af" "me")
directions=("north" "south" "east" "west" "central" "northeast" "southeast")
numbers=(1 2 3 4 5)

region=$(shuf -n1 -e "${regions[@]}")
direction=$(shuf -n1 -e "${directions[@]}")
server=$(shuf -n1 -e "${numbers[@]}")


AGENT_NAME="${region}-${direction}-${server}"

echo "Creating node ${AGENT_NAME}"

WSL_IP=$(hostname -I | awk '{print $1}')
docker volume create ${AGENT_NAME}
docker run --rm --privileged -d --name ${AGENT_NAME} -v ${AGENT_NAME}:/var/lib/rancher   -e K3S_URL=https://host.docker.internal:6443   -e K3S_TOKEN=${K3S_TOKEN}   rancher/k3s:v1.32.4-k3s1   agent --node-name ${AGENT_NAME} --node-label region="${region}-${direction}" --node-label server="${server}" --server https://${WSL_IP}:6443
