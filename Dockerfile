#base OS is alpine with tor installed
FROM alpine
WORKDIR /app

#install utilities
RUN apk --no-cache --no-progress upgrade && \
    apk --no-cache --no-progress add bash curl tini

#install tor
RUN apk --no-cache --no-progress add tor

#make tor configuration changes
RUN echo 'AutomapHostsOnResolve 1' >>/etc/tor/torrc && \
    echo 'ControlPort 9051' >>/etc/tor/torrc && \
    echo 'ControlSocket /etc/tor/run/control' >>/etc/tor/torrc && \
    echo 'ControlSocketsGroupWritable 1' >>/etc/tor/torrc && \
    echo 'CookieAuthentication 1' >>/etc/tor/torrc && \
    echo 'CookieAuthFile /etc/tor/run/control.authcookie' >>/etc/tor/torrc && \
    echo 'CookieAuthFileGroupReadable 1' >>/etc/tor/torrc && \
    echo 'DNSPort 5353' >>/etc/tor/torrc && \
    echo 'DataDirectory /var/lib/tor' >>/etc/tor/torrc && \
    echo 'ExitPolicy reject *:*' >>/etc/tor/torrc && \
    echo 'Log notice stderr' >>/etc/tor/torrc && \
    echo 'RunAsDaemon 1' >>/etc/tor/torrc && \
    echo 'SocksPort 0.0.0.0:9050 IsolateDestAddr' >>/etc/tor/torrc && \
    echo 'TransPort 0.0.0.0:9040' >>/etc/tor/torrc && \
    echo 'User tor' >>/etc/tor/torrc && \
    echo 'VirtualAddrNetworkIPv4 10.192.0.0/10' >>/etc/tor/torrc && \
    echo 'HiddenServiceDir /var/lib/tor/hidden_service' >>/etc/tor/torrc && \
    echo 'HiddenServicePort 6000 127.0.0.1:6000' >>/etc/tor/torrc && \
    mkdir -p /etc/tor/run && \
    chown -Rh tor. /var/lib/tor /etc/tor/run && \
    chmod 0750 /etc/tor/run && \
    rm -rf /tmp/*

#install node.js
RUN apk --no-cache --no-progress add npm && \
    rm -rf /tmp/*
EXPOSE 6000

COPY ./package.json .
RUN npm install

COPY ./app.js .
COPY ./lnbitsAPI.js .
COPY ./paymenthandler.js .

HEALTHCHECK --interval=60s --timeout=15s --start-period=20s \
    CMD curl -s --socks5 127.0.0.1:9050 'https://check.torproject.org/' | grep -qm1 Congratulations

RUN chown -Rh tor. /etc/tor /var/lib/tor /var/log/tor 2>&1 | \
            grep -iv 'Read-only' || :

ENTRYPOINT tor && node app.js



