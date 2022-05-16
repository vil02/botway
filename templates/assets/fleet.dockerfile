FROM botwayorg/botway:latest AS bw

COPY . .

RUN botway init --docker

FROM rust:alpine

ENV PACKAGES "build-dependencies build-base gcc git libsodium ffmpeg opus autoconf automake libtool m4 youtube-dl"

RUN apk update && \
	apk add --no-cache --virtual ${PACKAGES}

# Add packages you want
# RUN apk add PACKAGE_NAME

COPY --from=bw /root/.botway /root/.botway

COPY . .

RUN curl -L https://raw.githubusercontent.com/dimensionhq/fleet/master/installer/install.sh | bash

RUN fleet build --release --bin bot

EXPOSE 8000

ENTRYPOINT ["./target/release/bot"]
