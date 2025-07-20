// Service Worker para gerenciar push notifications
const CACHE_NAME = 'notifications-cache-v1';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker de notificações instalado');
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker de notificações ativado');
  event.waitUntil(self.clients.claim());
});

// Receber push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification recebida:', event);

  let notificationData = {
    title: 'Nova mensagem',
    body: 'Você tem uma nova mensagem no Assistente IA',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'default',
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Erro ao parsear dados do push:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      timestamp: notificationData.timestamp || Date.now()
    }
  );

  event.waitUntil(promiseChain);
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action === 'close') {
    return;
  }

  // Determinar URL para abrir
  let urlToOpen = notificationData.url || '/';
  
  if (action === 'open' || !action) {
    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Verificar se já existe uma janela aberta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin)) {
          // Focar na janela existente e navegar para a URL
          return client.focus().then(() => {
            return client.navigate(urlToOpen);
          });
        }
      }
      
      // Se não há janela aberta, abrir uma nova
      return clients.openWindow(urlToOpen);
    });

    event.waitUntil(promiseChain);
  }
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
  
  // Aqui você pode enviar analytics ou fazer cleanup
  const notificationData = event.notification.data || {};
  
  // Opcional: enviar evento para analytics
  if (notificationData.trackClose) {
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(err => console.log('Erro ao enviar analytics:', err));
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Sincronização em background');
    
    const promiseChain = fetch('/api/notifications/sync')
      .then(response => response.json())
      .then(data => {
        if (data.notifications && data.notifications.length > 0) {
          return Promise.all(
            data.notifications.map(notification => 
              self.registration.showNotification(notification.title, notification.options)
            )
          );
        }
      })
      .catch(error => {
        console.error('Erro na sincronização:', error);
      });

    event.waitUntil(promiseChain);
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida no SW:', event.data);

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    
    const promiseChain = self.registration.showNotification(title, {
      ...options,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-192x192.png'
    });

    event.waitUntil(promiseChain);
  }

  if (event.data && event.data.type === 'GET_SUBSCRIPTION') {
    self.registration.pushManager.getSubscription()
      .then(subscription => {
        event.ports[0].postMessage({
          type: 'SUBSCRIPTION_RESULT',
          subscription: subscription
        });
      });
  }
});