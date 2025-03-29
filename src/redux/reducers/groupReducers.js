import * as types from '../constants/groupConstants';

const initialState = {
  groups: [],
  loading: false,
  error: null,
  totalPages: 0,
  totalItems: 0,
  notification: null,
  currentPage: 1,
  searchTerm: '',
  minMembers: '',
  maxMembers: '',
  sortField: 'name',
  sortType: 'asc',
  selectedGroups: []
};

export const groupReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GROUP_LIST_REQUEST:
      return {
        ...state,
        loading: true
      };
    case types.GROUP_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: action.payload.groups,
        totalPages: action.payload.totalPages,
        totalItems: action.payload.totalItems,
        error: null
      };
    case types.GROUP_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case types.GROUP_CREATE_REQUEST:
    case types.GROUP_EDIT_REQUEST:
    case types.GROUP_DELETE_REQUEST:
      return {
        ...state,
        loading: true
      };
    case types.GROUP_CREATE_SUCCESS:
    case types.GROUP_EDIT_SUCCESS:
    case types.GROUP_DELETE_SUCCESS:
      return {
        ...state,
        loading: false
      };
    case types.GROUP_CREATE_FAIL:
    case types.GROUP_EDIT_FAIL:
    case types.GROUP_DELETE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case types.SET_NOTIFICATION:
      return {
        ...state,
        notification: action.payload
      };
    case types.CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: null
      };
    default:
      return state;
  }
};