// Sidebar
export const SET_PROFILE_PICTURE = '';

export const setProfilePicture = (profilePicture) => ({
  type: SET_PROFILE_PICTURE,
  profilePicture
});

export default function reducer(
  state = {
    profilePicture: ''
  },
  action
) {
  switch (action.type) {
    case SET_PROFILE_PICTURE:
      return {
        ...state,
        profilePicture: action.profilePicture
      };
    default:
      break;
  }
  return state;
}
