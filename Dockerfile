FROM python:3.10.13-alpine

RUN apk update && apk add python3-dev gcc libc-dev libffi-dev libxslt-dev libxml2 rust cargo
# set workdir 
WORKDIR /app

# copy requirements.txt
COPY requirements.txt .

# install requirements
RUN pip install --no-cache-dir --upgrade pip
RUN pip install -r requirements.txt

# copy app
COPY . .

CMD ["python", "main.py"]
