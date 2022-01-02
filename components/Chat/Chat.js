import {
  mapActions,
  mapGetters
} from 'vuex';
import Modal from '@/components/Modal';
import SigninForm from '@/components/Forms/Signin';

const badWords = [
  "niqqa", "niqqer", "niqqers", "nibba", "nibber", "killyourselfass-fuckerassfucker",
  "assfukka", "asswhole", "c0cksucker", "cock-sucker", "cockface", "cockhead",
  "cockmunch", "cockmunchercocksuck", "cocksucked", "cocksucker", "cocksucking",
  "cocksucks", "cocksuka", "cocksukkacokmuncher", "coksucka", "cuntlick", "cuntlicker",
  "cuntlickingdickhead", "fuckingshitmotherfuckerhardcoresex", "mo-fo", "mof0", "mofo",
  "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker",
  "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker",
  "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking",
  "motherfuckings", "motherfuckka", "motherfucks", "muthafecker", "muthafuckkermutherfucker",
  "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger",
  "niggersretard", "shithead", "slut", "sluts", "whore",
];

function ordinalSuffix(i) {
  const j = i % 10;
  const k = i % 100;

  if (j === 1 && k !== 11) {
    return `${i}st`;
  }

  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }

  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }

  return `${i}th`;
}

export default {
  name: 'chat',

  props: {
    autoconnect: {
      type: Boolean,
      default: true,
    },
    websocketUrl: {
      type: String,
      default: null,
    },
    testing: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    Modal,
    SigninForm,
  },

  data() {
    return {
      message: '',
      messages: [],
      keywords: [],
      ranks: ['MOD', 'CONT', 'DEV', 'RETIRED'],
      unreadMessages: 0,
      noPermissionNotification: {
        message: 'Notifications disabled\nWe will not notify you when someone mentions your username.',
        icon: 'warning',
        timeout: 6000,
        action: {
          label: 'Enable notifications',
          trigger: () => this.toggleBrowserNotifications(true),
        },
        hideOnTrigger: true,
      },
      socketConnected: false,
      connectionMessage: 'Attempting to connect with the chat...',
      alertSound: null,
      alertPlaying: false,
      chatObserver: null,
      socket: null,
      clients: [],
      socketReconnectCount: -1,
      socketReconnecting: false,
      socketReconnectTime: 3000,
      clickedUser: null,
      warnReason: '',
      banReason: '',
      banDurationMinutes: 0,
      banDurationHours: 0,
      banDurationDays: 0,
    };
  },

  mounted() {
    this.disableOnBnp();
  },

  beforeDestroy() {
    this.idleSignin = false;
    this.disconnect();
  },

  methods: {
    ...mapActions([
      'banUser',
      'showNotification',
      'hideNotification',
      'toggleBrowserNotifications',
      'toggleUserMute',
      'patchLibrary',
    ]),

    connect() {
      if (this.socket && (
          this.socket.readyState === window.WebSocket.OPEN ||
          this.socket.readyState === window.WebSocket.CONNECTING
        )) {
        return;
      }

      if ('WebSocket' in window === false) {
        this.connectionMessage = 'Seems like you\'re using a very old web browser. '
          + 'Try upgrading it because behind this wall there is a chat. '
          + 'This chat doesn\'t work on older browsers like yours '
          + 'and also this site might not work as well.';

        return;
      }

      this.socket = new window.WebSocket(this.socketUrl);

      if ('MutationObserver' in window) {
        this.chatObserver = new window.MutationObserver(this.onChatMutation);
      }

      this.socket.onopen = () => {
        this.socketReconnectCount = 0;
        this.socketConnected = true;
        this.socketReconnectTime = 3000;

        if (this.user) {
          this.sendRequest({ type: 'auth', content: this.user.token });
        }

        if (this.chatObserver && this.$refs.messagesContainer) {
          this.chatObserver.observe(this.$refs.messagesContainer, {
            childList: true,
            subtree: true,
          });
        }

        this.$emit('socketopen');
      };

      this.socket.onclose = (e) => {
        if (this.socketReconnectCount === -1) {
          this.socketReconnectCount = 0;
        }

        if (e.code > 1001) {
          this.reconnect();
        } else {
          this.disconnect();
        }
        this.$emit('socketclose');
      };

      if (!this.testing) {
        this.socket.onmessage = message =>
          this.onSocketMessage(JSON.parse(message.data));
      }
    },

    scrollBottom() {
      const messagesContainer = this.$refs.messagesContainer;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    disconnect() {
      this.socketConnected = false;

      if (this.socket && this.socket.readyState !== window.WebSocket.CLOSED) {
        this.socket.close();
        this.$set(this, 'messages', []);
        this.$set(this, 'clients', []);
        this.$set(this, 'keywords', []);
      }

      if (this.chatObserver) {
        this.chatObserver.disconnect();
      }
    },

    reconnect() {
      if (!this.socketReconnecting) {
        this.socketReconnectCount += 1;

        if (this.socketReconnectCount > 5) {
          this.connectionMessage = 'Failed to reconnect to the chat after 6 attempts';
          return;
        }

        this.connectionMessage = `Failed to reconnect to the chat for the ${ordinalSuffix(this.socketReconnectCount)} time\nTrying again later...`;

        this.socketReconnecting = true;

        this.disconnect();

        setTimeout(() => {
          this.socketReconnecting = false;
          this.connect();
        }, this.socketReconnectTime);

        this.socketReconnectTime *= 1.5;
      }
    },

    onSocketMessage(message) {
      switch (message.type) {
        case 'msg':
          this.onMessageReceive({
            type: message.type,
            message: message.content.msg,
            user: message.content.user,
            time: new Date(message.timestamp),
          });
          break;

        case 'log':
        case 'announcement':
          this.onMessageReceive({
            type: message.type,
            message: message.content,
            time: new Date(message.timestamp),
          });
          break;

        case 'warning':
        case 'exception':
          this.showNotification({
            message: message.content,
            timeout: 6000 * (message.type === 'exception' ? 5 : 1),
            time: new Date(message.timestamp),
            icon: message.type === 'warning' ? 'warning' : 'error',
          });
          break;

        case 'reset':
          this.clearMessages();
          break;

        case 'ban':
          this.banUser(message.content);
          break;

        case 'client-add':
          this.addClient(message.content);
          break;

        case 'client-remove':
          this.removeClient(message.content);
          break;

        case 'logout':
          this.onSocketLogout();
          break;

        case 'user':
          this.onSocketUser();
          break;

        default: break;
      }
    },

    removeClient(client) {
      const clientIndex = this.getClientIndex(client.username);

      if (clientIndex > -1) {
        this.clients.splice(clientIndex, 1);
      }
    },

    addClient(client) {
      if (this.getClientIndex(client.username) === -1) {
        this.clients.push(client);
      }
    },

    getClientIndex(username) {
      return this.clients.findIndex(c => c.username === username);
    },

    onChatMutation(mutations) {
      const lastMutation = mutations ? mutations[mutations.length - 1] : undefined;
      const noChange = lastMutation && lastMutation.removedNodes.length === lastMutation.addedNodes.length;

      if (noChange || !this.groupedMessages.length) {
        return;
      }

      if (this.isBottom(this.getSafezone())) {
        this.scrollBottom();
      } else {
        this.unreadMessages += 1;
      }
    },

    onChatScroll() {
      if (this.groupedMessages.length > 0 && this.isBottom(this.getSafezone())) {
        this.unreadMessages = 0;
      }
    },

    isBottom(sz) {
      const safezone = sz || 0;
      const messagesContainer = this.$refs.messagesContainer;

      const isScrollable = messagesContainer.scrollHeight > messagesContainer.clientHeight;
      const clientHeight = messagesContainer.scrollHeight - Math.round(messagesContainer.scrollTop);

      return !isScrollable || clientHeight - safezone <= messagesContainer.clientHeight;
    },

    clearMessages() {
      this.messages = [];
    },

    submitMessage() {
      const message = this.message.trim().replace(/ +(?= )/g, '');

      if (message) {
        this.scrollBottom();
        this.sendMessage(message);
        this.message = '';
      }
    },

    warnUser(user) {
      this.sendMessage(`/warn ${user.username} for ${this.warnReason}`);
      this.warnReason = '';
    },

    tempBanUser(user) {
      this.sendMessage(`/ban ${user.username} ${this.banDuration} for ${this.banReason}`);
      this.banReason = '';
      this.banDurationMinutes = 0;
      this.banDurationHours = 0;
      this.banDurationDays = 0;
    },

    permaBanUser(user) {
      this.sendMessage(`/ban ${user.username} for ${this.banReason}`);
      this.banReason = '';
    },

    onMessageReceive(message) {
      this.messages.push(message);

      const messageLength = this.messages.length;
      const maxMessagesLength = 500;
      if (messageLength > maxMessagesLength) {
        this.messages = this.messages.slice(messageLength - maxMessagesLength, messageLength);
      }

      if ((!this.user || (
          this.user && message.user &&
          this.user.username !== message.user.username
        )) && !document.hasFocus() && this.useBrowserNotifications) {
        const keywordsMentioned = this.keywords
          .filter(keyword =>
            message.message
            .toLowerCase()
            .indexOf(keyword.toLowerCase()) > -1);

        if (keywordsMentioned.length > 0) {
          const title = `New message from ${message.user.username}`;
          let msg = message.message.substring(0, 100);

          if (message.message.length > 100) {
            msg += '…';
          }

          this.alert(title, msg);
        }
      }
    },

    sendMessage(message) {
      this.sendRequest({ type: 'msg', content: message });
    },

    sendRequest(requestObject) {
      if (this.socket && this.socket.readyState === window.WebSocket.OPEN) {
        this.socket.send(JSON.stringify(requestObject));
        this.$emit('requestsend', requestObject);
      }
    },

    alert(title, msg) {
      if (!this.useBrowserNotifications) {
        return;
      }

      const notification = new window.Notification(title, {
        body: msg,
        tag: 'chat_mention',
        icon: '/public/img/logo-black.png',
      });

      notification.onshow = () => {
        const waitTime = Math.max(6000, msg.replace(/[^a-z]/i, '').length * 120);
        if (!this.alertPlaying) {
          this.alertSound.play();
          this.alertPlaying = true;
        }

        setTimeout(() => {
          notification.close();
          this.alertPlaying = false;
        }, waitTime);
      };

      notification.onclick = () => {
        notification.close();
        window.focus();
      };
    },

    getSafezone() {
      const wh = Math.abs(screen.height - screen.width);
      const safezone = Math.min(screen.height * 0.1, wh);
      const lastMessage = this.$refs.messages[this.$refs.messages.length - 1];

      return safezone + (lastMessage ? lastMessage.clientHeight : 0);
    },

    disableOnBnp() {
      if (this.$route && this.$route.params.slug &&
        this.$route.params.slug.match(/boku-no-pico|bokunopico/i)) {
        this.disconnect();
        this.connectionMessage = 'Chat is disabled on Boku No Pico';
      } else if (!this.socketConnected && this.autoconnect) {
        this.connect();
      }
    },

    messageKeyDown(e) {
      if (e.keyCode === 9) {
        e.preventDefault();
        this.tabComplete();
      }
    },

    tabComplete() {
      const index = this.message.lastIndexOf(' ') + 1;
      const lastWord = this.message.substr(index, this.message.length).toLowerCase();

      if (lastWord.length === 0) {
        return;
      }

      const replacements = this.clients.filter(client =>
        client.username.toLowerCase().indexOf(lastWord) === 0);

      if (replacements.length > 0) {
        let replacement = null;

        if (index === 0) {
          replacement = replacements[0].username.concat(': ');
        } else {
          replacement = replacements[0].username.concat(' ');
        }

        this.message = this.message.substr(0, index).concat(replacement);
      }
    },

    onSocketLogout() {
      this.keywords = [];
      this.alertSound = null;
    },

    onSocketUser() {
      this.idleSignin = false;

      if (this.username !== '' && this.password !== '') {
        this.toggleBrowserNotifications(true);

        this.username = '';
        this.password = '';
      }

      this.keywords.push(this.user.username);

      if ('Audio' in window) {
        this.alertSound = new window.Audio(`${window.location.origin}/public/sounds/notification.wav`);
        this.alertSound.volume = 0.85;
      }
    },
  },

  watch: {
    user() {
      if (this.user) {
        this.sendRequest({ type: 'auth', content: this.user.token });
        this.patchLibrary();
      } else {
        this.sendRequest({ type: 'logout' });
      }
    },

    useBrowserNotifications() {
      if (!this.useBrowserNotifications) {
        this.showNotification(this.noPermissionNotification);
      } else {
        this.hideNotification(this.noPermissionNotification);
      }
    },

    $route() {
      this.disableOnBnp();
    },

    messages() {
      if (!this.chatObserver && this.$refs.messages) {
        this.onChatMutation();
      }
    },
  },

  computed: {
    ...mapGetters([
      'useBrowserNotifications',
      'user',
      'signinErrors',
      'userBan',
      'userMuted',
      'profanityEnabled',
    ]),

    form() {
      return {
        username: this.username,
        password: this.password,
      };
    },

    socketUrl() {
      // return 'wss://ws.test.twist.moe/';
      return this.websocketUrl || this.protocol + this.subdomain + location.hostname + this.port;
    },

    protocol() {
      return `${location.protocol.split('http').join('ws')}//`;
    },

    subdomain() {
      return location.hostname.indexOf('twist.moe') > -1 ? 'ws.' : '';
    },

    port() {
      return location.hostname === 'twist.moe' ? ':443' : '';
    },

    groupedMessages() {
      const grouped = [];

      for (let i = 0; i < this.messages.length; i += 1) {
        const message = this.messages[i];

        const messageTimestamp = ((time) => {
          let hours = time.getHours();
          let minutes = time.getMinutes();

          const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jan', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          if (hours < 10) hours = `0${hours}`;
          if (minutes < 10) minutes = `0${minutes}`;

          let returnstring = `${hours}:${minutes}`;
          if (time.getDay() !== new Date().getDay()) {
            returnstring += ` ${time.getDate()}-${monthName[time.getMonth()]}-${time.getFullYear()}`;
          }

          return returnstring;
        })(new Date(message.time));

        const lastGroup = grouped[grouped.length - 1];

        const groupsUserMatch = lastGroup
          && message.user && lastGroup.user
          && message.user.username === lastGroup.user.username;

        const groupsTypeMatch = lastGroup
          && !message.user && message.type === lastGroup.type;

        const filteredMessage = !this.profanityEnabled
          ? message.message.split(' ').map((word) => {
              const badWordIndex = badWords.indexOf(word.toLowerCase().replace(/[^a-z0-9\-]/ig, ''));
              const badWord = badWords[badWordIndex];

              return badWord ? '*'.repeat(badWord.length) : word;
            }).join(' ')
          : message.message;

        if (groupsUserMatch || groupsTypeMatch) {
          lastGroup.msgs.push({
            message: filteredMessage,
            time: messageTimestamp,
          });
        } else if (message.type === 'announcement' || message.type === 'log') {
          grouped.push({
            type: message.type,
            msgs: [{
              message: filteredMessage,
              time: messageTimestamp,
            }],
          });
        } else {
          grouped.push({
            user: message.user,
            type: message.type,
            msgs: [{
              message: filteredMessage,
              time: messageTimestamp,
            }],
          });
        }
      }

      return grouped;
    },

    banDuration() {
      return this.banDurationMinutes +
        (this.banDurationHours * 60) +
        (this.banDurationDays * 24 * 60);
    },
  },
};
