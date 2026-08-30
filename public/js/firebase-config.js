{
  const isInstalledApp=(navigator.standalone===true)||window.matchMedia('(display-mode: standalone)').matches;
  const isAppleMobile=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const useSameOriginAuth=isInstalledApp&&isAppleMobile&&location.hostname==='canzoniere.matteodelfabbro.it';

  firebase.initializeApp({
    apiKey: 'AIzaSyD-YU1dsAqLQMp4bcdnLoRGE2HBLyM2Uek',
    authDomain: useSameOriginAuth
      ? 'canzoniere.matteodelfabbro.it'
      : 'canzoniere-san-marco-6130a.firebaseapp.com',
    databaseURL: '',
    messagingSenderId: '336828091164',
    projectId: 'canzoniere-san-marco-6130a',
    storageBucket: 'canzoniere-san-marco-6130a.firebasestorage.app'
  });
}
