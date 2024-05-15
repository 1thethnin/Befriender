var navigationRef;

export function setNavigationRef(ref) {
  navigationRef = ref;
}

export function goBack() {
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function navigate(name, params) {
  navigationRef.navigate(name, params);
}

export function isUserInConference() {
  if (!navigationRef) {
    return;
  }
  return navigationRef.getCurrentRoute().name === 'Conference';
}