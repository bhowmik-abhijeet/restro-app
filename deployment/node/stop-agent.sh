#!/bin/bash
# This is exclusively for WSL. You can extend this for your env
set -e

# 1. List running Kubernetes nodes
echo "Fetching Kubernetes nodes..."
nodes=($(kubectl get nodes -o jsonpath='{.items[*].metadata.name}'))

if [ ${#nodes[@]} -eq 0 ]; then
  echo "No nodes found in the cluster."
  exit 1
fi

echo "Available nodes:"
for i in "${!nodes[@]}"; do
  printf "%3d) %s\n" $((i+1)) "${nodes[$i]}"
done

# 2. Ask user to choose a node
read -rp "Select node to delete by number: " choice
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#nodes[@]}" ]; then
  echo "Invalid selection."
  exit 1
fi

selected_node="${nodes[$((choice-1))]}"
echo "Selected node: $selected_node"

# 3. Delete the Kubernetes node
echo "Deleting Kubernetes node $selected_node..."
# kubectl drain "$selected_node" --ignore-daemonsets --delete-emptydir-data --force

kubectl delete node "$selected_node"

# 4. Delete Docker container with same name
echo "Deleting Docker container named $selected_node (if exists)..."
if docker ps -a --format '{{.Names}}' | grep -qw "$selected_node"; then
  docker rm -f "$selected_node"
  echo "Docker container $selected_node deleted."
else
  echo "No Docker container named $selected_node found."
fi

# 5. Delete Docker volume with same name
echo "Deleting Docker volume named $selected_node (if exists)..."
if docker volume ls -q | grep -qw "$selected_node"; then
  docker volume rm "$selected_node"
  echo "Docker volume $selected_node deleted."
else
  echo "No Docker volume named $selected_node found."
fi

echo "Done."
