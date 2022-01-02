import api from '@/api';

export default async ({ route, store, redirect }) => {
  const goToBan = () => {
    if (route.path !== '/ban') {
      redirect('/ban');
    }
  }

  if (!process.browser) {
    try {
      await api.request.motd.getMessage();
    } catch (error) {
      if (error.response && error.response.status === 403
        && error.response.data && error.response.data.user
      ) {
        goToBan();
      }
    }
  } else if (store.getters.userBan) {
    goToBan();
  }
}
