import pika
import os
import json
from dotenv import load_dotenv

load_dotenv("../.env")


def publish_to_rabbitmq(queue_name, payload):
    try:
        host = "localhost"
        port = "5672"
        user = os.getenv("RABBITMQ_DEFAULT_USER")
        password = os.getenv("RABBITMQ_DEFAULT_PASS")
        credentials = pika.PlainCredentials(username=user, password=password)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, port=port, credentials=credentials)
        )
        channel = connection.channel()

        channel.queue_declare(queue=queue_name, durable=True)

        channel.basic_publish(
            exchange="",
            routing_key=queue_name,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),  # Make message persistent
        )
        print(f"[GRPC_SERVER] Sent '{payload}' to '{queue_name}'")

        connection.close()
        print("[GRPC_SERVER] All messages sent successfully.")

    except Exception as e:
        print(f"[!!!] Error: {e}")


payload = {
    "key": "08b806c73bb7ebf7eebe9396d80a6693",
    "type": "s3store",
    "bucket": "raw-uploads",
}
publish_to_rabbitmq("video-transcode", payload)
