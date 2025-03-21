import Cookies from "js-cookie";
export const localToken = {
  get: () => JSON.parse(localStorage.getItem('token')),
  set: (token) => localStorage.setItem('token', JSON.stringify(token)),
  remove: () => localStorage.removeItem('token'),
};

export const cookieToken = {
  get: () =>
    JSON.parse(
      Cookies.get('token') !== undefined
        ? Cookies.get('token')
        : null
    ),
  set: (token) => Cookies.set('token', JSON.stringify(token)),
  remove: () => Cookies.remove('token'),
};

const tokenMethod = {
  get: () => {
    return cookieToken.get();
  },
  set: (token) => {
    cookieToken.set(token);
  },
  remove: () => {
    cookieToken.remove();
  },
};

export default tokenMethod;