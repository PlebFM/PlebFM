export const getUserProfileFromLocal = () => {
  const userProfileJSON = localStorage.getItem('userProfile');
  if (userProfileJSON) {
    return JSON.parse(userProfileJSON);
  }
};
