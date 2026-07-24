=> Detected service running on port 10000
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
Failed to send email via SMTP
Traceback (most recent call last):
  File "/opt/render/project/src/backend/app/utils/email.py", line 32, in send_email
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/python/Python-3.12.13/lib/python3.12/smtplib.py", line 255, in __init__
    (code, msg) = self.connect(host, port)
                  ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/python/Python-3.12.13/lib/python3.12/smtplib.py", line 341, in connect
    self.sock = self._get_socket(host, port, self.timeout)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/python/Python-3.12.13/lib/python3.12/smtplib.py", line 312, in _get_socket
    return socket.create_connection((host, port), timeout,
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/python/Python-3.12.13/lib/python3.12/socket.py", line 865, in create_connection
    raise exceptions[0]
  File "/opt/render/project/python/Python-3.12.13/lib/python3.12/socket.py", line 850, in create_connection
    sock.connect(sa)
OSError: [Errno 101] Network is unreachable
Email send failed for kabuligak4k@gmail.com: Failed to send email: [Errno 101] Network is unreachable
Email send failed during registration for kabuligak4k@gmail.com: Failed to send verification email: Failed to send email: [Errno 101] Network is unreachable
INFO:     149.54.64.94:0 - "POST /api/v1/auth/register HTTP/1.1" 201 Created