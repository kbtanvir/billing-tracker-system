generate_password:
	openssl rand -base64 14

kill_process:
	sudo lsof -i :8080
	sudo kill -9 <PID>
