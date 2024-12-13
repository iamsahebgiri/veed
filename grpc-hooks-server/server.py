import grpc
from concurrent import futures
import hook_pb2_grpc as pb2_grpc
import hook_pb2 as pb2
from rmq import publish_to_rabbitmq
import os
from dotenv import load_dotenv

load_dotenv("../.env")

class HookHandler(pb2_grpc.HookHandlerServicer):

    def __init__(self, *args, **kwargs):
        pass

    def InvokeHook(self, hook_request, context):
        hook_response = pb2.HookResponse()
        VIDEO_TRANSCODE_QUEUE = os.getenv('VIDEO_TRANSCODE_QUEUE') 
        # Example: Use the post-finish hook to print information about a completed upload,
        # including its storage location.
        if hook_request.type == "post-finish":
            id = hook_request.event.upload.id
            size = hook_request.event.upload.size
            storage = hook_request.event.upload.storage
            payload = {
                "key": storage["Key"],
                "type": storage["Type"],
                "bucket": storage["Bucket"],
            }
            publish_to_rabbitmq(VIDEO_TRANSCODE_QUEUE, payload)
            print(f"[GRPC_SERVER] Upload {id} ({size} bytes) is finished. Find the file at: {storage}")

        # Return the hook response to send back to tusd
        return hook_response


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_HookHandlerServicer_to_server(HookHandler(), server)
    server.add_insecure_port("[::]:8090")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
