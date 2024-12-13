```sh
uv sync
uv run make -B grpc-generate

# Start gRPC server (listening at localhost:8000)
uv run python server.py

# In a separate terminal you can now run tusd and point it to the gRPC server
tusd -hooks-grpc localhost:8000
```