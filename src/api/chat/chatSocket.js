// STOMP 연결 유틸
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = 'http://localhost:9090/ws/chat';

// STOMP 클라이언트 생성 + 연결
// onMessage : 새 메시지 수신 시 호출될 콜백(subscribe 대상 topic에서 옴)
export function connectChatSocket(sessionId, onMessage, onConnect) {
    const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        onConnect: () => {
            client.subscribe(`/topic/chat/${sessionId}`, (message) => {
                const body = JSON.parse(message.body);
                onMessage(body);
            });
            if (onConnect) onConnect();
        },
    });

    client.activate();
    return client;
}

// 메시지 전송
export function sendChatSocketMessage(client, sessionId, senderType, senderId, content) {
    client.publish({
        destination: `/app/chat/${sessionId}`,
        body: JSON.stringify({ senderType, senderId, content }),
    });
}

// 연결 종료
export function disconnectChatSocket(client) {
    if (client) client.deactivate();
}