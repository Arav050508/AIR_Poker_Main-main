// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJ68YVIvFHLRxntGDf2LuAwvVMtKepaOE",
    authDomain: "txholdempokermain.firebaseapp.com",
    projectId: "txholdempokermain",
    storageBucket: "txholdempokermain.appspot.com",
    messagingSenderId: "77309873762",
    appId: "1:77309873762:web:78986c6ebe738745fbcb3b",
    measurementId: "G-3L4MY23NCX"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const analytics = firebase.analytics();
  
  // DOM elements - Forms and containers
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const gameInterface = document.getElementById('game-interface');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  
  // DOM elements - User info displays
  const userDisplayName = document.getElementById('user-display-name');
  const userChips = document.getElementById('user-chips');
  const userGames = document.getElementById('user-games');
  const userWins = document.getElementById('user-wins');
  const userLosses = document.getElementById('user-losses');
  const activityList = document.getElementById('activity-list');
  
  // Track current user and listener
  let currentUser = null;
  let userListener = null;
  
  // Achievement tracking with tiers
  let achievements = {
      // BETTING
      'small-bet': { unlocked: false, tier: 'bronze', stars: 1, condition: 'Bet 25+ chips in a single hand', description: 'You\'re learning to bet! Small bets lead to big wins.', requirement: 'Bet 25+ chips in one hand', tooltip: 'Why this matters: Starting small builds confidence. In recovery, small steps lead to lasting change.' },
      'medium-bet': { unlocked: false, tier: 'silver', stars: 2, condition: 'Bet 300+ chips in a single hand', description: 'Stepping up your game! Medium bets show confidence.', requirement: 'Bet 300+ chips in one hand', tooltip: 'Why this matters: Calculated risks show growth. Recovery is about finding balance between caution and courage.' },
      'high-roller': { unlocked: false, tier: 'gold', stars: 3, condition: 'Bet 800+ chips in a single hand', description: 'Big spender! You\'re not afraid to put your chips where your mouth is. High stakes, high rewards!', requirement: 'Bet 800+ chips in one hand', tooltip: 'Why this matters: Confidence in your decisions. Recovery teaches us to trust our judgment when we\'ve done the work.' },
      'millionaire': { unlocked: false, tier: 'platinum', stars: 4, condition: 'Bet 2000+ chips in a single hand', description: 'Millionaire mindset! You\'re not afraid to go all-in with massive bets.', requirement: 'Bet 2000+ chips in one hand', tooltip: 'Why this matters: Bold moves require preparation. In recovery, big changes come from consistent small actions.' },
      'whale': { unlocked: false, tier: 'diamond', stars: 5, condition: 'Bet 5000+ chips in a single hand', description: 'You\'re a true high roller! Only the bravest go this far.', requirement: 'Bet 5000+ chips in one hand', tooltip: 'Why this matters: Extreme confidence comes from experience. Recovery mastery means knowing when to take calculated risks.' },
      // WINNING
      'first-win': { unlocked: false, tier: 'bronze', stars: 1, condition: 'Win your first hand', description: 'Congratulations! You\'ve won your first hand of poker. This is just the beginning of your poker journey!', requirement: 'Win 1 hand', tooltip: 'Why this matters: Every victory counts, no matter how small. Recovery is built on celebrating every step forward.' },
      'winning-streak': { unlocked: false, tier: 'silver', stars: 2, condition: 'Win 4 hands in a row', description: 'You\'re on fire! Winning 4 consecutive hands shows you have what it takes to dominate the table.', requirement: 'Win 4 consecutive hands', tooltip: 'Why this matters: Momentum builds success. In recovery, consistent positive choices create unstoppable progress.' },
      'winning-master': { unlocked: false, tier: 'gold', stars: 3, condition: 'Win 25+ hands', description: 'You\'re becoming a winning machine! Double digits in wins is impressive.', requirement: 'Win 25 hands', tooltip: 'Why this matters: Experience creates expertise. Recovery veterans know that every day sober is a victory worth celebrating.' },
      'legend': { unlocked: false, tier: 'platinum', stars: 4, condition: 'Win 75+ hands', description: 'Legendary status! You\'ve won more hands than most players ever will.', requirement: 'Win 75 hands', tooltip: 'Why this matters: Persistence creates legends. Long-term recovery is about staying committed through every challenge.' },
      'ultimate-streak': { unlocked: false, tier: 'diamond', stars: 5, condition: 'Win 8 hands in a row', description: 'Unstoppable! Eight consecutive wins is the mark of a true poker master.', requirement: 'Win 8 consecutive hands', tooltip: 'Why this matters: Unstoppable momentum. Recovery champions know that consistency is the key to lasting change.' },
      // EXPERIENCE
      'first-game': { unlocked: false, tier: 'bronze', stars: 1, condition: 'Play your first hand', description: 'Welcome to the table! Your poker adventure begins with your first hand.', requirement: 'Play 1 hand', tooltip: 'Why this matters: Every journey begins with a single step. Recovery starts with the courage to try something new.' },
      'experienced': { unlocked: false, tier: 'silver', stars: 2, condition: 'Play 50+ hands', description: 'You\'re getting the hang of this! Experience is building up.', requirement: 'Play 50 hands', tooltip: 'Why this matters: Practice builds skill. Recovery is a skill that improves with every day of practice.' },
      'veteran': { unlocked: false, tier: 'gold', stars: 3, condition: 'Play 150+ hands', description: 'Experience matters! You\'ve played enough hands to know the game inside and out. A true poker veteran.', requirement: 'Play 150 hands', tooltip: 'Why this matters: Veterans know the patterns. Long-term recovery teaches you to recognize triggers and avoid pitfalls.' },
      'champion': { unlocked: false, tier: 'platinum', stars: 4, condition: 'Achieve 75%+ win rate with 50+ hands', description: 'Champion status achieved! With a 75%+ win rate, you\'re clearly a master of the game.', requirement: '75% win rate with 50+ hands', tooltip: 'Why this matters: Excellence comes from consistency. Recovery champions make healthy choices most of the time.' },
      'marathoner': { unlocked: false, tier: 'diamond', stars: 5, condition: 'Play 500+ hands', description: 'Endurance and skill! You\'ve played 500+ hands.', requirement: 'Play 500 hands', tooltip: 'Why this matters: Endurance wins the race. Recovery is a marathon, not a sprint - persistence is everything.' },
      // SPECIAL
      'river-king': { unlocked: false, tier: 'bronze', stars: 1, condition: 'Win a hand with a river card', description: 'River King! You won with the final community card. Sometimes the river brings the luck you need!', requirement: 'Win with a river card', tooltip: 'Why this matters: Never give up hope. Recovery often brings unexpected blessings when we stay committed to the process.' },
      'fold-master': { unlocked: false, tier: 'silver', stars: 2, condition: 'Fold 10 hands in a row', description: 'Fold Master! You know when to fold \'em. Disciplined folding is a key poker skill.', requirement: 'Fold 10 hands in a row', tooltip: 'Why this matters: Smart restraint is key to recovery. Know when to walk away from situations that could trigger relapse.' },
      'collector': { unlocked: false, tier: 'gold', stars: 3, condition: 'Unlock 10 achievements', description: 'Collector! You\'ve unlocked 10 achievements.', requirement: 'Unlock 10 achievements', tooltip: 'Why this matters: Every milestone matters. Recovery is about celebrating every victory, no matter how small.' },
      'all-rounder': { unlocked: false, tier: 'platinum', stars: 4, condition: 'Win with every hand type', description: 'All-Rounder! You\'ve won with every hand type.', requirement: 'Win with every hand type', tooltip: 'Why this matters: Versatility is strength. Recovery requires adapting to different challenges and finding multiple paths to success.' },
      'perfectionist': { unlocked: false, tier: 'diamond', stars: 5, condition: 'Unlock all other achievements', description: 'Perfectionist! You\'ve unlocked every achievement in the game.', requirement: 'Unlock all other achievements', tooltip: 'Why this matters: Complete dedication to growth. Recovery perfection isn\'t about never slipping, but about always getting back up.' },
      // RECOVERY PATH (NEW CATEGORY)
      'first-journal': { unlocked: false, tier: 'bronze', stars: 1, condition: 'Make your first journal entry', description: 'Recovery begins with reflection! Your first journal entry marks the start of your healing journey.', requirement: 'Write your first journal entry', tooltip: 'Why this matters: Self-reflection is the foundation of recovery. Writing helps process emotions and track progress.' },
      'fold-discipline': { unlocked: false, tier: 'silver', stars: 2, condition: 'Fold 3 big hands in a row', description: 'Discipline Master! You showed restraint when the stakes were high. Smart folding leads to long-term success.', requirement: 'Fold 3 consecutive big hands', tooltip: 'Why this matters: Discipline in high-pressure moments. Recovery requires saying no to triggers even when they seem tempting.' },
      'week-without-allin': { unlocked: false, tier: 'gold', stars: 3, condition: 'Play 7 days without going "all-in"', description: 'Steady Progress! You maintained control for a full week. Consistent, measured play builds lasting recovery.', requirement: '7 days without all-in bets', tooltip: 'Why this matters: Avoiding extremes is key to recovery. Sustainable change comes from balanced, consistent choices.' },
      'mindful-player': { unlocked: false, tier: 'platinum', stars: 4, condition: 'Take 10 breaks during gameplay', description: 'Mindful Master! You recognize when to step back and breathe. Self-awareness is crucial for recovery.', requirement: 'Take 10 mindful breaks', tooltip: 'Why this matters: Self-awareness prevents relapse. Knowing when to pause and reflect is a crucial recovery skill.' },
      'recovery-champion': { unlocked: false, tier: 'diamond', stars: 5, condition: 'Complete the Recovery Path', description: 'Recovery Champion! You\'ve mastered the art of mindful, disciplined play. Your journey inspires others.', requirement: 'Complete all Recovery Path achievements', tooltip: 'Why this matters: You\'ve become a role model. Recovery champions show others that healing and growth are possible.' }
  };
  
  // Track consecutive wins for streak achievement
  let consecutiveWins = 0;
  let maxBetInHand = 0;
  let lowestChipsReached = 1000;
  
  // Add this helper at the top:
  function getCurrentUserId() {
    if (auth && auth.currentUser && auth.currentUser.uid) return auth.currentUser.uid;
    if (typeof getUserIdFromURL === 'function') return getUserIdFromURL();
    return null;
  }
  
  // Update updateUserStatsUI to use getCurrentUserId
  function updateUserStatsUI() {
    const userId = getCurrentUserId();
    if (!userId) return;
    // Chips
    const chips = localStorage.getItem(`pokerChips_${userId}`) || '1000';
    const chipsBox = document.getElementById('user-chips');
    if (chipsBox) chipsBox.textContent = chips;
  }
  
  // Also call updateUserStatsUI after login or page load
  window.addEventListener('DOMContentLoaded', updateUserStatsUI);
  
  // After successful login and showing the game interface, call updateUserStatsUI
  // Find the code that shows the game interface after login and add:
  // updateUserStatsUI();
  
  // Add this function near the top (after DOM elements):
  function loadChipsFromLocalStorage() {
      if (!auth.currentUser) return null;
      const userId = auth.currentUser.uid;
      try {
          const savedChips = localStorage.getItem(`pokerChips_${userId}`);
          if (savedChips) {
              return JSON.parse(savedChips);
          }
      } catch (e) {
          console.error('Failed to load chips from local storage:', e);
      }
      return null;
  }
  
  // ====================
  // FORM NAVIGATION
  // ====================
  
  // Show register form
  document.getElementById('show-register').addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      loginError.textContent = '';
      analytics.logEvent('view_register_form');
  });
  
  // Show login form
  document.getElementById('show-login').addEventListener('click', function(e) {
      e.preventDefault();
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      registerError.textContent = '';
      analytics.logEvent('view_login_form');
  });
  
  // ====================
  // DATABASE OPERATIONS
  // ====================
  
  // 1. Create initial user document in Firestore
  function createUserDocument(user, username) {
      return db.collection('users').doc(user.uid).set({
          username: username,
          email: user.email,
          chips: 1000,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
  
  // 2. Get current user data
  function getCurrentUserData() {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid).get().then(doc => {
          if (doc.exists) {
              return doc.data();
          } else {
              console.error("No user data found");
              return null;
          }
      });
  }
  
  // 3. Update user's login timestamp
  function updateLastLogin() {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
  
  // 4. Update user's chip count
  function updateChips(amount) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid).update({
          chips: firebase.firestore.FieldValue.increment(amount)
      });
  }
  
  // 5. Record game result
  function recordGameResult(isWin, chipChange) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      const updates = {
          gamesPlayed: firebase.firestore.FieldValue.increment(1),
      };
      
      if (isWin) {
          updates.wins = firebase.firestore.FieldValue.increment(1);
      } else {
          updates.losses = firebase.firestore.FieldValue.increment(1);
      }
      
      return db.collection('users').doc(auth.currentUser.uid).update(updates);
  }
  
  // 6. Create a new game record
  function createGameRecord(playerIds, initialBets) {
      return db.collection('games').add({
          players: playerIds,
          startTime: firebase.firestore.FieldValue.serverTimestamp(),
          initialBets: initialBets,
          status: 'in_progress'
      });
  }
  
  // 7. Complete a game record
  function completeGameRecord(gameId, winner, pot) {
      return db.collection('games').doc(gameId).update({
          endTime: firebase.firestore.FieldValue.serverTimestamp(),
          winner: winner,
          pot: pot,
          status: 'completed'
      });
  }
  
  // 8. End game transaction (update winner's chips and game record)
  function endGameTransaction(gameId, winnerId, pot) {
      const batch = db.batch();
      
      // Update winner's chips
      const winnerRef = db.collection('users').doc(winnerId);
      batch.update(winnerRef, {
          chips: firebase.firestore.FieldValue.increment(pot),
          wins: firebase.firestore.FieldValue.increment(1),
          gamesPlayed: firebase.firestore.FieldValue.increment(1)
      });
      
      // Update game status
      const gameRef = db.collection('games').doc(gameId);
      batch.update(gameRef, {
          winner: winnerId,
          pot: pot,
          endTime: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'completed'
      });
      
      // Commit the batch
      return batch.commit();
  }
  
  // 9. Add activity to user's history
  function addUserActivity(description) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid)
          .collection('activities').add({
              description: description,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
  }
  
  // 10. Get user's recent activities
  function getRecentActivities(limit = 5) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid)
          .collection('activities')
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get()
          .then(snapshot => {
              return snapshot.docs.map(doc => doc.data());
          });
  }
  
  // ====================
  // USER AUTHENTICATION
  // ====================
  
  // Register new user
  document.getElementById('register-button').addEventListener('click', function() {
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      // Clear previous error
      registerError.textContent = '';
      
      // Form validation
      if (!username || !email || !password || !confirmPassword) {
          registerError.textContent = 'All fields are required';
          return;
      }
      
      if (password !== confirmPassword) {
          registerError.textContent = 'Passwords do not match';
          return;
      }
      
      if (password.length < 6) {
          registerError.textContent = 'Password must be at least 6 characters';
          return;
      }
      
      // First check if username is already taken
      db.collection('users')
          .where('username', '==', username)
          .get()
          .then((snapshot) => {
              if (!snapshot.empty) {
                  registerError.textContent = 'Username already taken';
                  return Promise.reject('Username already taken');
              }
              
              // Create user in Firebase Authentication
              return auth.createUserWithEmailAndPassword(email, password);
          })
          .then((userCredential) => {
              // Add user to Firestore database with initial data
              return createUserDocument(userCredential.user, username);
          })
          .then(() => {
              // Add initial activity to Firestore
              return addUserActivity('Account created');
          })
          .then(() => {
              // Also add account creation activity to localStorage for recent activity panel
              if (typeof window !== 'undefined' && window.addRecentActivity) {
                  window.addRecentActivity('Account created', 'account');
              }
          })
          .then(() => {
              // Registration success
              analytics.logEvent('sign_up', { method: 'email' });
              alert('Account created successfully! You are now logged in.');
              
              // Clear form fields
              document.getElementById('register-username').value = '';
              document.getElementById('register-email').value = '';
              document.getElementById('register-password').value = '';
              document.getElementById('register-confirm-password').value = '';
          })
          .catch((error) => {
              // Handle errors
              registerError.textContent = error.message;
              analytics.logEvent('sign_up_error', { error: error.message });
          });
  });
  
  // Login user
  document.getElementById('login-button').addEventListener('click', function() {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      // Clear previous error
      loginError.textContent = '';
      
      // Form validation
      if (!email || !password) {
          loginError.textContent = 'Email and password are required';
          return;
      }
      
      // Sign in with Firebase Authentication
      auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
              // Login success - UI update is handled by auth state listener
              analytics.logEvent('login', { method: 'email' });
              document.getElementById('login-email').value = '';
              document.getElementById('login-password').value = '';
              
              // Update last login time
              return updateLastLogin();
          })
          .then(() => {
              // Add login activity to localStorage for recent activity panel
              if (typeof window !== 'undefined' && window.addRecentActivity) {
                  window.addRecentActivity('Logged in', 'account');
              }
          })
          .then(() => {
              // After user is authenticated and UI is updated, set the Start New Game button href with user ID and username
              updateStartGameButtonHref();
          })
          .then(() => {
              updateUserStatsUI();
          })
          .then(() => {
              // If poker game is loaded, update hand strength display and keyboard shortcuts
              if (window.displayPlayerInfo) {
                  window.displayPlayerInfo();
              }
              if (window.setupKeyboardShortcuts) {
                  window.setupKeyboardShortcuts();
              }
          })
          .then(() => {
              if (window.updateTooltips) {
                  window.updateTooltips();
              }
          })
          .catch((error) => {
              // Handle errors
              loginError.textContent = error.message;
              analytics.logEvent('login_error', { error: error.message });
          });
  });
  
  // Logout user
  document.getElementById('logout-button').addEventListener('click', function() {
      // First add logout activity to localStorage for recent activity panel
      if (typeof window !== 'undefined' && window.addRecentActivity) {
          window.addRecentActivity('Logged out', 'account');
      }
      
      analytics.logEvent('logout');
      
      // Then sign out
      auth.signOut()
          .catch((error) => {
              alert('Error signing out: ' + error.message);
          });
  });
  
  // ====================
  // USER INTERFACE
  // ====================
  
  // Setup real-time listener for user data
  function setupUserListener(userId) {
      // Clear previous listener if exists
      if (userListener) {
          userListener();
          userListener = null;
      }
      
      // Set up new listener
      userListener = db.collection('users').doc(userId)
          .onSnapshot((doc) => {
              if (doc.exists) {
                  const userData = doc.data();
                  
                  // Update UI with user data
                  userDisplayName.textContent = userData.username;
                  // Use chips from local storage if available, otherwise Firestore
                  const localChips = loadChipsFromLocalStorage();
                  if (localChips && typeof localChips[3] === 'number') {
                      userChips.textContent = localChips[3];
                  } else {
                      userChips.textContent = userData.chips;
                  }
                  updateHandsPlayedDisplay();
                  updateWinsDisplay();
                  updateLossesDisplay();
                  updateWinRate();
                  updateStreakDisplay();
                  
                  // Initialize achievements
                  loadAchievements();
                  updateAchievementDisplay();
                  updateAchievementProgress();
                  setupAchievementClickListeners();
                  checkAchievements();
              }
          }, (error) => {
              console.error("Error in user data listener:", error);
          });
          
      // Also load recent activities
      loadRecentActivities();
  }
  
  // ====================
  // RECENT ACTIVITY INTERACTIVITY
  // ====================
  
  const activityModal = document.getElementById('activity-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalActivityTitle = document.getElementById('modal-activity-title');
  const modalActivityDetails = document.getElementById('modal-activity-details');
  const filterButtons = document.querySelectorAll('.activity-filter');
  const exportActivityBtn = document.getElementById('export-activity');
  
  let allActivities = [];
  
  // Helper: Get icon for activity type
  function getActivityIcon(type, desc) {
      if (type === 'win' || desc.toLowerCase().includes('win')) return '🏆';
      if (type === 'loss' || desc.toLowerCase().includes('loss')) return '💔';
      if (type === 'account' || desc.toLowerCase().includes('account') || 
          desc.toLowerCase().includes('login') || desc.toLowerCase().includes('logout')) return '👤';
      if (desc.toLowerCase().includes('chip')) return '🪙';
      return '🎲';
  }
  
  // Helper: Get type for activity
  function getActivityType(desc) {
      if (/win/i.test(desc)) return 'win';
      if (/loss|lost/i.test(desc)) return 'loss';
      if (/account|created|login|logout/i.test(desc)) return 'account';
      return 'other';
  }
  
  // Animate new activity
  function animateActivity(li) {
      li.classList.add('activity-new');
      setTimeout(() => li.classList.remove('activity-new'), 1200);
  }
  
  // Render activities with filter
  function renderActivities(filter = 'all') {
      console.log('[DEBUG] renderActivities called with filter:', filter);
      console.log('[DEBUG] allActivities length:', allActivities.length);
      
      // Show loading state
      const emptyStateEl = document.getElementById('activity-empty-state');
      const activityListEl = document.getElementById('activity-list');
      
      emptyStateEl.classList.add('hidden');
      activityListEl.style.display = 'none';
      
      setTimeout(() => {
          activityListEl.style.display = 'block';
          
          activityListEl.innerHTML = '';
          let filtered = filter === 'all' ? allActivities : allActivities.filter(a => a.type === filter);
          
          console.log('[DEBUG] filtered activities length:', filtered.length);
          
          if (filtered.length === 0) {
              emptyStateEl.classList.remove('hidden');
              if (filter !== 'all') {
                  emptyStateEl.querySelector('.empty-text').textContent = `No ${filter} activities`;
                  emptyStateEl.querySelector('.empty-subtext').textContent = `Try selecting a different filter`;
              } else {
                  emptyStateEl.querySelector('.empty-text').textContent = 'No activities yet';
                  emptyStateEl.querySelector('.empty-subtext').textContent = 'Start playing to see your activity history';
              }
              return;
          }
          
          filtered.forEach((activity, idx) => {
              const li = document.createElement('li');
              li.setAttribute('data-type', activity.type);
              li.setAttribute('data-idx', idx);
              li.setAttribute('data-category', activity.type);
              
              const performanceClass = getPerformanceClass(activity);
              const categoryText = getCategoryText(activity.type);
              
              li.innerHTML = `
                  <span class="activity-icon">${activity.icon}</span>
                  <span class="activity-content">
                      <span class="activity-description">${activity.description}</span>
                      <span class="activity-category ${activity.type}">${categoryText}</span>
                  </span>
                  <div class="activity-performance">
                      <div class="performance-indicator ${performanceClass}"></div>
                  </div>
                  <span class="activity-time">${activity.timeString}</span>
              `;
              
              li.classList.add('activity-item');
              activityListEl.appendChild(li);
          });
          
          // Also populate the separate wins and losses sections if they exist
          const winsList = document.getElementById('activity-list-wins');
          const lossesList = document.getElementById('activity-list-losses');
          
          if (winsList) {
              winsList.innerHTML = '';
              const winActivities = allActivities.filter(activity => activity.type === 'win');
              if (winActivities.length === 0) {
                  const li = document.createElement('li');
                  li.textContent = 'No wins yet';
                  winsList.appendChild(li);
              } else {
                  winActivities.forEach((activity, idx) => {
                      const li = document.createElement('li');
                      li.setAttribute('data-type', activity.type);
                      li.setAttribute('data-idx', idx);
                      li.innerHTML = `<span class="activity-icon">${activity.icon}</span> ${activity.description} <span class="activity-time">${activity.timeString}</span>`;
                      li.classList.add('activity-item');
                      winsList.appendChild(li);
                  });
              }
          }
          
          if (lossesList) {
              lossesList.innerHTML = '';
              const lossActivities = allActivities.filter(activity => activity.type === 'loss');
              if (lossActivities.length === 0) {
                  const li = document.createElement('li');
                  li.textContent = 'No losses yet';
                  lossesList.appendChild(li);
              } else {
                  lossActivities.forEach((activity, idx) => {
                      const li = document.createElement('li');
                      li.setAttribute('data-type', activity.type);
                      li.setAttribute('data-idx', idx);
                      li.innerHTML = `<span class="activity-icon">${activity.icon}</span> ${activity.description} <span class="activity-time">${activity.timeString}</span>`;
                      li.classList.add('activity-item');
                      lossesList.appendChild(li);
                  });
              }
          }
          
          // Update summary
          // updateActivitySummary(); // Removed since summary bar is no longer used
          
      }, 500);
  }
  
  // Show modal for activity
  function showActivityModal(activity, idx) {
      modalActivityTitle.textContent = activity.description;
      modalActivityDetails.innerHTML = `<strong>Time:</strong> ${activity.timeString || 'N/A'}<br><strong>Type:</strong> ${activity.type}`;
      activityModal.classList.remove('hidden');
  }
  closeModalBtn.onclick = () => activityModal.classList.add('hidden');
  
  // Filter buttons
  filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderActivities(btn.dataset.filter);
      });
  });
  
  // Export activity log
  exportActivityBtn.addEventListener('click', () => {
      const data = allActivities.map(a => `${a.description} (${a.timeString})`).join('\n');
      const blob = new Blob([data], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'activity_log.txt';
      a.click();
      URL.revokeObjectURL(url);
  });
  
  // Load and render activities (override loadRecentActivities)
  function loadRecentActivities() {
      console.log('[DEBUG] loadRecentActivities called');
      
      // First try to get activities from localStorage using current user ID
      let localActivities = [];
      if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const key = `recentActivities_${userId}`;
          try {
              const storedActivities = localStorage.getItem(key);
              if (storedActivities) {
                  localActivities = JSON.parse(storedActivities);
                  console.log('[DEBUG] Loaded activities from localStorage for user', userId, ':', localActivities);
              } else {
                  console.log('[DEBUG] No activities found in localStorage for user', userId);
              }
          } catch (error) {
              console.error('[ERROR] Failed to load activities from localStorage:', error);
          }
      } else {
          console.log('[DEBUG] No authenticated user, cannot load localStorage activities');
      }
      
      // Then get activities from Firestore
      getRecentActivities(20)
          .then((firestoreActivities) => {
              // Filter out login/logout activities from Firestore since we handle them in localStorage
              const filteredFirestoreActivities = firestoreActivities.filter(activity => {
                  const description = activity.description ? activity.description.toLowerCase() : '';
                  return !description.includes('logged in') && !description.includes('logged out');
              });
              
              // Merge activities from both sources
              const mergedActivities = [...localActivities, ...filteredFirestoreActivities];
              
              // Sort by timestamp (newest first)
              mergedActivities.sort((a, b) => {
                  const timeA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime()) : 0;
                  const timeB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime()) : 0;
                  return timeB - timeA;
              });
              
              // Take only the first 20 activities
              const limitedActivities = mergedActivities.slice(0, 20);
              
              allActivities = limitedActivities.map((activity, idx) => {
                  let timeString = '';
                  let id = activity.timestamp ? activity.timestamp.seconds + '-' + idx : idx;
                  if (activity.timestamp) {
                      const date = activity.timestamp.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
                      timeString = `${date.toLocaleString()}`;
                  }
                  
                  // Preserve existing type and icon from localStorage activities, or calculate for Firestore activities
                  const type = activity.type || getActivityType(activity.description);
                  const icon = activity.icon || getActivityIcon(type, activity.description);
                  
                  // Debug logging for win activities
                  if (activity.description && activity.description.toLowerCase().includes('win')) {
                      console.log('[DEBUG] Win activity detected:', {
                          description: activity.description,
                          originalType: activity.type,
                          originalIcon: activity.icon,
                          calculatedType: type,
                          calculatedIcon: icon
                      });
                  }
                  
                  return {
                      ...activity,
                      id,
                      type,
                      icon,
                      timeString
                  };
              });
              renderActivities();
          })
          .catch((error) => {
              // If Firestore fails, still show localStorage activities
              console.error('[ERROR] Failed to load activities from Firestore:', error);
              if (localActivities.length > 0) {
                  allActivities = localActivities.map((activity, idx) => {
                      let timeString = '';
                      let id = activity.timestamp ? new Date(activity.timestamp).getTime() + '-' + idx : idx;
                      if (activity.timestamp) {
                          const date = new Date(activity.timestamp);
                          timeString = `${date.toLocaleString()}`;
                      }
                      
                      // Preserve existing type and icon from localStorage activities
                      const type = activity.type || getActivityType(activity.description);
                      const icon = activity.icon || getActivityIcon(type, activity.description);
                      
                      // Debug logging for win activities
                      if (activity.description && activity.description.toLowerCase().includes('win')) {
                          console.log('[DEBUG] Win activity detected (fallback):', {
                              description: activity.description,
                              originalType: activity.type,
                              originalIcon: activity.icon,
                              calculatedType: type,
                              calculatedIcon: icon
                          });
                      }
                      
                      return {
                          ...activity,
                          id,
                          type,
                          icon,
                          timeString
                      };
                  });
                  renderActivities();
              } else {
                  activityList.innerHTML = '<li>Error loading activities</li>';
              }
          });
  }
  
  // Animate new activity when added
  function addAnimatedActivity(description) {
      const type = getActivityType(description);
      const icon = getActivityIcon(type, description);
      const now = new Date();
      const activity = {
          description,
          type,
          icon,
          timeString: now.toLocaleString(),
          id: now.getTime() + '-' + Math.random()
      };
      allActivities.unshift(activity);
      renderActivities();
      if (activityList.firstChild) animateActivity(activityList.firstChild);
  }
  
  // ====================
  // AUTH STATE CHANGES
  // ====================
  
  // Auth state listener - handles UI updates when auth state changes
  auth.onAuthStateChanged((user) => {
      if (user) {
          // User is signed in
          currentUser = user;
          
          // Ensure Firestore user document exists
          db.collection('users').doc(user.uid).get().then(doc => {
              if (!doc.exists) {
                  // Use email prefix as username if not present
                  const defaultUsername = user.email ? user.email.split('@')[0] : 'user';
                  createUserDocument(user, defaultUsername);
              }
          });
          
          // Show game interface and hide forms
          loginForm.classList.add('hidden');
          registerForm.classList.add('hidden');
          gameInterface.classList.remove('hidden');
          
          // Set up real-time listener for user data
          setupUserListener(user.uid);
          
          // Track user login
          analytics.setUserId(user.uid);
          analytics.logEvent('user_authenticated');
          
          // Update hands played display from localStorage
          updateHandsPlayedDisplay();
          updateWinsDisplay();
          updateLossesDisplay();
          
          // Load recent activities from localStorage and Firestore
          loadRecentActivities();
          
          // Update start game button text
          updateStartGameButtonText();
      } else {
          // User is signed out
          currentUser = null;
          
          // Clear any user listeners
          if (userListener) {
              userListener();
              userListener = null;
          }
          
          // Show login form and hide others
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
          gameInterface.classList.add('hidden');
          
          // Reset error messages
          loginError.textContent = '';
          registerError.textContent = '';
      }
  });
  
  // Function to update the start game button text
  function updateStartGameButtonText() {
      const startGameBtn = document.getElementById('start-game-btn');
      if (startGameBtn) {
          let sessionEnded = false;
          const userId = auth.currentUser ? auth.currentUser.uid : null;
          if (userId) {
              const endedTimestamp = localStorage.getItem(`sessionEnded_${userId}`);
              if (endedTimestamp) {
                  const now = Date.now();
                  if (now - parseInt(endedTimestamp, 10) < 3600000) {
                      sessionEnded = true;
                  }
              }
          }
          if (localStorage.getItem('hasEverStartedGame') === 'true' || (userId && localStorage.getItem(`hasOngoingGame_${userId}`) === 'true')) {
              startGameBtn.textContent = '🎲 Continue Game';
          } else {
              startGameBtn.textContent = '🎲 Start New Game';
          }
          startGameBtn.disabled = false;
          if (sessionEnded) {
              startGameBtn.textContent = 'Come back in an hour to continue';
              startGameBtn.onclick = showLockoutOverlay;
          } else {
              startGameBtn.onclick = null;
          }
      }
  }
  
  // Ensure DOM is loaded before attaching event listener
  window.addEventListener('DOMContentLoaded', function() {
      const startGameBtn = document.getElementById('start-game-btn');
      if (startGameBtn) {
          // --- NEW: Check if session ended today and disable if so ---
          let sessionEnded = false;
          const userId = auth.currentUser ? auth.currentUser.uid : null;
          if (userId) {
              const endedTimestamp = localStorage.getItem(`sessionEnded_${userId}`);
              if (endedTimestamp) {
                  const now = Date.now();
                  if (now - parseInt(endedTimestamp, 10) < 3600000) { // 1 hour = 3600000 ms
                      sessionEnded = true;
                  }
              }
          }
          startGameBtn.disabled = !!sessionEnded;
          if (sessionEnded) {
              startGameBtn.textContent = 'Come back in an hour to continue';
          }
          // --- END NEW ---
          if (!sessionEnded) {
              startGameBtn.disabled = false;
              startGameBtn.addEventListener('click', function() {
                  console.log('Start Game button clicked');
                  if (!auth.currentUser) {
                      alert('You must be logged in to start a game.');
                      return;
                  }
                  // Mark ongoing game in localStorage
                  localStorage.setItem(`hasOngoingGame_${auth.currentUser.uid}`, 'true');
                  startGameBtn.disabled = true;
                  startGameBtn.textContent = 'Loading...';
                  // Set flag so button always says 'Continue Game' after first click
                  localStorage.setItem('hasEverStartedGame', 'true');
                  db.collection('users').doc(auth.currentUser.uid).get().then(doc => {
                      if (doc.exists) {
                          const userData = doc.data();
                          const username = userData.username || 'Player';
                          window.location.href = `poker_index.html?userId=${auth.currentUser.uid}&username=${encodeURIComponent(username)}`;
                      } else {
                          window.location.href = `poker_index.html?userId=${auth.currentUser.uid}&username=Player`;
                      }
                  }).catch(error => {
                      console.error('Error getting user data:', error);
                      window.location.href = `poker_index.html?userId=${auth.currentUser.uid}&username=Player`;
                  });
              });
          }
      }
  
      // CONTACT US BUTTON LOGIC
      const contactUsBtn = document.getElementById('contact-us-btn');
      const contactUsScreen = document.getElementById('contact-us-screen');
      const closeContactUsBtn = document.getElementById('close-contact-us');
      const contactForm = document.getElementById('contact-form');
      const contactSuccess = document.getElementById('contact-success');
  
      if (contactUsBtn && contactUsScreen && closeContactUsBtn && contactForm) {
        contactUsBtn.addEventListener('click', function() {
          contactUsScreen.classList.remove('hidden');
          document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
        closeContactUsBtn.addEventListener('click', function() {
          contactUsScreen.classList.add('hidden');
          document.body.style.overflow = '';
          contactSuccess.style.display = 'none';
          contactForm.reset();
        });
        contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          fetch('http://localhost:3001/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: document.getElementById('contact-name').value,
              email: document.getElementById('contact-email').value,
              message: document.getElementById('contact-message').value
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              contactSuccess.style.display = 'block';
              setTimeout(() => {
                contactUsScreen.classList.add('hidden');
                document.body.style.overflow = '';
                contactSuccess.style.display = 'none';
                contactForm.reset();
              }, 1800);
            } else {
              alert('Failed to send message. Please try again later.');
            }
          })
          .catch(() => {
            alert('Failed to send message. Please try again later.');
          });
        });
      }
  
      // Show/hide Contact Us button based on profile visibility
      const gameInterface = document.getElementById('game-interface');
      function updateContactUsBtnVisibility() {
        if (gameInterface && !gameInterface.classList.contains('hidden')) {
          contactUsBtn.style.display = '';
        } else {
          contactUsBtn.style.display = 'none';
        }
      }
      // Initial check
      updateContactUsBtnVisibility();
      // Observe changes to game interface visibility
      const observer = new MutationObserver(updateContactUsBtnVisibility);
      if (gameInterface) {
        observer.observe(gameInterface, { attributes: true, attributeFilter: ['class'] });
      }
  });
  
  // When returning to main menu, call updateStartGameButtonText() to update the button label
  window.addEventListener('DOMContentLoaded', function() {
      updateStartGameButtonText();
  });
  
  // Refresh activities when user returns to the page (e.g., from poker interface)
  document.addEventListener('visibilitychange', function() {
      if (!document.hidden && auth.currentUser) {
          console.log('[DEBUG] Page became visible, refreshing activities');
          loadRecentActivities();
          // Sync recovery path variables from poker game
          syncRecoveryPathVariables();
          // Check for journal achievement
          checkJournalAchievement();
          // Check achievements after syncing
          if (typeof checkAchievements === 'function') {
              checkAchievements();
          }
      }
  });
  
  // Also refresh activities when window gains focus
  window.addEventListener('focus', function() {
      if (auth.currentUser) {
          console.log('[DEBUG] Window gained focus, refreshing activities');
          loadRecentActivities();
          // Sync recovery path variables from poker game
          syncRecoveryPathVariables();
          // Check for journal achievement
          checkJournalAchievement();
          // Check achievements after syncing
          if (typeof checkAchievements === 'function') {
              checkAchievements();
          }
      }
  });
  
  // Update user's record after playing a hand
  function updateHandResult(isWin) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      const updates = {};
      
      if (isWin) {
          updates.wins = firebase.firestore.FieldValue.increment(1);
      } else {
          updates.losses = firebase.firestore.FieldValue.increment(1);
      }
      
      return db.collection('users').doc(auth.currentUser.uid).update(updates);
  }
  
  // Update a user's chips after a hand
  function updateChipsAfterHand(chipChange) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      return db.collection('users').doc(auth.currentUser.uid).update({
          chips: firebase.firestore.FieldValue.increment(chipChange)
      }).then(() => {
          // Add activity record about chip change
          let description = chipChange >= 0 ? 
              `Won ${chipChange} chips` : 
              `Lost ${Math.abs(chipChange)} chips`;
          return addUserActivity(description);
      });
  }
  window.updateChipsAfterHand = updateChipsAfterHand;
  
  // Get user's hand history
  function getUserHandHistory(limit = 10) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid)
          .collection('handHistory')
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get()
          .then(snapshot => {
              return snapshot.docs.map(doc => doc.data());
          });
  }
  
  // Record hand details
  function recordHandDetails(cards, bet, result, opponents) {
      if (!auth.currentUser) return Promise.reject("No user logged in");
      
      return db.collection('users').doc(auth.currentUser.uid)
          .collection('handHistory').add({
              cards: cards,  // Array of card objects/strings
              bet: bet,      // Amount bet on this hand
              result: result, // "win", "loss", "fold", etc.
              chipChange: result === "win" ? bet : -bet,
              opponents: opponents, // Array of opponent usernames/IDs
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
  }
  
  window.updateHandResult = updateHandResult;
  window.addUserActivity = addUserActivity;
  window.loadRecentActivities = loadRecentActivities;
  window.resetAchievements = resetAchievements;
  window.validateAchievements = validateAchievements;
  window.trackGameEvent = trackGameEvent;
  
  // Debug function to reset achievement variables
  window.resetAchievementVariables = function() {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      consecutiveWins = 0;
      maxBetInHand = 0;
      lowestChipsReached = 1000;
      window.foldStreak = 0;
      window.riverWins = 0;
      localStorage.setItem(`consecutiveWins_${userId}`, consecutiveWins);
      localStorage.setItem(`maxBetInHand_${userId}`, maxBetInHand);
      localStorage.setItem(`lowestChipsReached_${userId}`, lowestChipsReached);
      localStorage.setItem(`foldStreak_${userId}`, window.foldStreak);
      localStorage.setItem(`riverWins_${userId}`, window.riverWins);
      console.log('[ACHIEVEMENT] Reset all achievement variables');
  };
  
  // Debug function to show current achievement variables
  window.showAchievementVariables = function() {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      console.log('[ACHIEVEMENT] Current variables:');
      console.log('- Consecutive Wins:', consecutiveWins);
      console.log('- Max Bet in Hand:', maxBetInHand);
      console.log('- Lowest Chips Reached:', lowestChipsReached);
      console.log('- Fold Streak:', window.foldStreak || 0);
      console.log('- River Wins:', window.riverWins || 0);
      console.log('- From localStorage:');
      console.log('  - Consecutive Wins:', localStorage.getItem(`consecutiveWins_${userId}`));
      console.log('  - Max Bet in Hand:', localStorage.getItem(`maxBetInHand_${userId}`));
      console.log('  - Lowest Chips Reached:', localStorage.getItem(`lowestChipsReached_${userId}`));
      console.log('  - Fold Streak:', localStorage.getItem(`foldStreak_${userId}`));
      console.log('  - River Wins:', localStorage.getItem(`riverWins_${userId}`));
  };
  
  // Debug function to test activity loading
  window.debugActivities = function() {
      console.log('[DEBUG] === ACTIVITY DEBUG INFO ===');
      console.log('[DEBUG] Current user:', auth.currentUser ? auth.currentUser.uid : 'None');
      
      if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const key = `recentActivities_${userId}`;
          const storedActivities = localStorage.getItem(key);
          console.log('[DEBUG] localStorage key:', key);
          console.log('[DEBUG] localStorage value:', storedActivities);
          
          if (storedActivities) {
              try {
                  const parsed = JSON.parse(storedActivities);
                  console.log('[DEBUG] Parsed activities:', parsed);
                  console.log('[DEBUG] Number of stored activities:', parsed.length);
              } catch (e) {
                  console.error('[DEBUG] Failed to parse stored activities:', e);
              }
          }
      }
      
      console.log('[DEBUG] allActivities array:', allActivities);
      console.log('[DEBUG] allActivities length:', allActivities.length);
      console.log('[DEBUG] activityList element:', activityList);
      
      // Force reload activities
      loadRecentActivities();
  };
  
  // ====================
  // ENHANCED ACTIVITY PANEL FUNCTIONALITY
  // ====================
  
  // Activity search functionality
  let searchTimeout;
  document.getElementById('activity-search-input').addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
          const searchTerm = e.target.value.toLowerCase();
          filterActivitiesBySearch(searchTerm);
      }, 300);
  });
  
  function filterActivitiesBySearch(searchTerm) {
      const activityItems = document.querySelectorAll('#activity-list li');
      let visibleCount = 0;
      
      activityItems.forEach(item => {
          const description = item.querySelector('.activity-description')?.textContent.toLowerCase() || '';
          const category = item.querySelector('.activity-category')?.textContent.toLowerCase() || '';
          const matches = description.includes(searchTerm) || category.includes(searchTerm);
          
          if (matches) {
              item.style.display = 'flex';
              visibleCount++;
          } else {
              item.style.display = 'none';
          }
      });
      
      // Show/hide empty state based on search results
      const emptyState = document.getElementById('activity-empty-state');
      if (visibleCount === 0 && searchTerm) {
          emptyState.classList.remove('hidden');
          emptyState.querySelector('.empty-text').textContent = 'No activities found';
          emptyState.querySelector('.empty-subtext').textContent = `No activities match "${searchTerm}"`;
      } else {
          emptyState.classList.add('hidden');
      }
  }
  
  // Quick action buttons functionality
  document.getElementById('refresh-activities').addEventListener('click', function() {
      this.disabled = true;
      this.innerHTML = '<span class="action-icon">⏳</span> Refreshing...';
      
      // Simulate refresh delay
      setTimeout(() => {
          loadRecentActivities();
          this.disabled = false;
          this.innerHTML = '<span class="action-icon">🔄</span> Refresh';
          
          // Show success feedback
          showActivityFeedback('Activities refreshed successfully!', 'success');
      }, 1000);
  });
  
  document.getElementById('activity-stats').addEventListener('click', function() {
      showActivityStats();
  });
  
  document.getElementById('activity-settings').addEventListener('click', function() {
      showActivitySettings();
  });
  
  document.getElementById('clear-activities').addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
          clearAllActivities();
      }
  });
  
  // Activity statistics modal
  function showActivityStats() {
      // Use the same logic as the poker stats modal, but without recent activity
      const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth.currentUser ? auth.currentUser.uid : null));
      const handsPlayed = parseInt(localStorage.getItem(`handsPlayed_${userId}`) || '0', 10);
      const wins = parseInt(localStorage.getItem(`wins_${userId}`) || '0', 10);
      const losses = parseInt(localStorage.getItem(`losses_${userId}`) || '0', 10);
      const streak = parseInt(localStorage.getItem(`consecutiveWins_${userId}`) || '0', 10);
      const winRate = handsPlayed > 0 ? ((wins / handsPlayed) * 100).toFixed(1) : '0.0';
      const modal = document.getElementById('activity-modal');
      const title = document.getElementById('modal-activity-title');
      const details = document.getElementById('modal-activity-details');
      const note = document.getElementById('activity-note');
      const saveBtn = document.getElementById('save-note');
  
      title.innerHTML = '<span style="color: #ffd700;">Your Poker Statistics</span>';
      details.innerHTML = `
          <div style=\"display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px;\">
            <div style=\"background:rgba(74,222,128,0.1); padding:10px; border-radius:8px; border-left:3px solid #4ade80;\">
              <strong style=\"color:#4ade80;\">Hands Played</strong><br>
              <span style=\"color:#00d4ff; font-size:1.2em;\">${handsPlayed}</span>
            </div>
            <div style=\"background:rgba(0,255,136,0.08); padding:10px; border-radius:8px; border-left:3px solid #00ff88;\">
              <strong style=\"color:#00ff88;\">Win Rate</strong><br>
              <span style=\"color:#00d4ff; font-size:1.2em;\">${winRate}%</span>
            </div>
            <div style=\"background:rgba(255,215,0,0.08); padding:10px; border-radius:8px; border-left:3px solid #ffd700;\">
              <strong style=\"color:#ffd700;\">Wins</strong><br>
              <span style=\"color:#ffd700; font-size:1.2em;\">${wins}</span>
            </div>
            <div style=\"background:rgba(248,113,113,0.08); padding:10px; border-radius:8px; border-left:3px solid #f87171;\">
              <strong style=\"color:#f87171;\">Losses</strong><br>
              <span style=\"color:#f87171; font-size:1.2em;\">${losses}</span>
            </div>
            <div style=\"background:rgba(96,165,250,0.08); padding:10px; border-radius:8px; border-left:3px solid #60a5fa; grid-column:span 2;\">
              <strong style=\"color:#60a5fa;\">Current Streak</strong><br>
              <span style=\"color:#00d4ff; font-size:1.2em;\">${streak} win${streak===1?'':'s'}</span>
            </div>
          </div>
        `;
      modal.classList.remove('hidden');
  }
  
  // === SETTINGS PERSISTENCE LOGIC (Save on Button Click) ===
  const SETTINGS_KEYS = [
      'show-hand-strength',
      'chip-animations',
      'enable-keyboard-shortcuts',
      'show-tooltips'
  ];
  
  function getSettingsStorageKey() {
      const userId = auth.currentUser?.uid || 'guest';
      return `userSettings_${userId}`;
  }
  
  function saveUserSettings() {
      const settings = {};
      SETTINGS_KEYS.forEach(key => {
          const el = document.getElementById(key);
          if (el) settings[key] = el.checked;
      });
      localStorage.setItem(getSettingsStorageKey(), JSON.stringify(settings));
      showActivityFeedback('Settings saved!', 'success');
      // If poker game is loaded, refresh all settings
      if (window.refreshPokerSettings) {
          window.refreshPokerSettings();
      }
  }
  
  function loadUserSettings() {
      const raw = localStorage.getItem(getSettingsStorageKey());
      if (!raw) {
          // Default: all ON
          const defaults = {};
          SETTINGS_KEYS.forEach(key => { defaults[key] = true; });
          return defaults;
      }
      try {
          return JSON.parse(raw);
      } catch (e) {
          return {};
      }
  }
  
  function applyUserSettings() {
      const settings = loadUserSettings();
      SETTINGS_KEYS.forEach(key => {
          const el = document.getElementById(key);
          if (el && typeof settings[key] === 'boolean') {
              el.checked = settings[key];
          }
      });
  }
  
  // Call this after settings modal is rendered
  function initializeSettingsPersistence() {
      applyUserSettings();
      // Attach save button listener
      const saveBtn = document.getElementById('save-settings-btn');
      if (saveBtn) {
          saveBtn.onclick = saveUserSettings;
      }
  }
  
  // Activity settings modal
  function showActivitySettings() {
      const modal = document.getElementById('activity-modal');
      const title = document.getElementById('modal-activity-title');
      const details = document.getElementById('modal-activity-details');
      const note = document.getElementById('activity-note');
      // Remove old saveBtn logic
      // Add Save Settings button
      title.innerHTML = '<span style="color: #ffd700;">Game Settings</span>';
      details.innerHTML = `
          <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; color: #00d4ff;">
                  <input type="checkbox" id="show-hand-strength"> Show hand strength info
              </label>
              <label style="display: block; margin-bottom: 8px; color: #00d4ff;">
                  <input type="checkbox" id="chip-animations"> Enable chip animations
              </label>
              <label style="display: block; margin-bottom: 8px; color: #00d4ff;">
                  <input type="checkbox" id="enable-keyboard-shortcuts"> Enable keyboard shortcuts
              </label>
              <label style="display: block; margin-bottom: 8px; color: #00d4ff;">
                  <input type="checkbox" id="show-tooltips"> Show tooltips/help
              </label>
          </div>
          <button id="save-settings-btn" style="background: linear-gradient(90deg, #ffd700 60%, #ffb300 100%); color: #1a1a2e; border: none; padding: 7px 18px; border-radius: 6px; font-weight: 600; font-size: 1em; margin-bottom: 10px; cursor: pointer; box-shadow: 0 2px 8px rgba(255,215,0,0.13); transition: background 0.2s, color 0.2s;">Save Settings</button>
      `;
      note.style.display = 'none';
      // Save button handled above
      setTimeout(initializeSettingsPersistence, 0);
      modal.classList.remove('hidden');
  }
  
  // Calculate activity statistics
  function calculateActivityStats() {
      const activities = allActivities || [];
      const total = activities.length;
      const wins = activities.filter(a => a.type === 'win').length;
      const losses = activities.filter(a => a.type === 'loss').length;
      const account = activities.filter(a => a.type === 'account').length;
      
      const winPercentage = total > 0 ? Math.round((wins / total) * 100) : 0;
      const lossPercentage = total > 0 ? Math.round((losses / total) * 100) : 0;
      
      const lastActivity = activities.length > 0 ? activities[0].timeString : null;
      
      // Calculate most active day
      const dayCounts = {};
      activities.forEach(activity => {
          if (activity.timeString) {
              const date = new Date(activity.timeString);
              const day = date.toDateString();
              dayCounts[day] = (dayCounts[day] || 0) + 1;
          }
      });
      
      const mostActiveDay = Object.keys(dayCounts).length > 0 
          ? Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b)
          : null;
      
      return {
          total,
          wins,
          losses,
          account,
          winPercentage,
          lossPercentage,
          lastActivity,
          mostActiveDay
      };
  }
  
  // Clear all activities
  function clearAllActivities() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      const key = `recentActivities_${userId}`;
      localStorage.removeItem(key);
      
      allActivities = [];
      renderActivities();
      
      showActivityFeedback('All activities cleared successfully!', 'success');
  }
  
  // Show activity feedback
  function showActivityFeedback(message, type = 'info') {
      const feedback = document.createElement('div');
      feedback.className = `activity-feedback ${type}`;
      feedback.textContent = message;
      feedback.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === 'success' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(255, 215, 0, 0.9)'};
          color: ${type === 'success' ? '#1a1a2e' : '#1a1a2e'};
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      `;
      
      document.body.appendChild(feedback);
      
      setTimeout(() => {
          feedback.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => {
              document.body.removeChild(feedback);
          }, 300);
      }, 3000);
  }
  
  // Export activities to file
  function exportActivitiesToFile() {
      const activities = allActivities || [];
      const data = activities.map(a => `${a.description} (${a.timeString})`).join('\n');
      const blob = new Blob([data], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poker_activities_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      showActivityFeedback('Activities exported successfully!', 'success');
  }
  
  // Get performance class based on activity
  function getPerformanceClass(activity) {
      if (activity.type === 'win') return 'good';
      if (activity.type === 'loss') return 'poor';
      return 'average';
  }
  
  // Get category text
  function getCategoryText(type) {
      switch(type) {
          case 'win': return 'Win';
          case 'loss': return 'Loss';
          case 'account': return 'Account';
          default: return 'Other';
      }
  }
  
  // Add CSS animations for feedback
  const style = document.createElement('style');
  style.textContent = `
      @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
      }
  `;
  document.head.appendChild(style);
  
  // Initialize activity panel features when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
      // Set up search functionality
      const searchInput = document.getElementById('activity-search-input');
      if (searchInput) {
          searchInput.addEventListener('input', function(e) {
              clearTimeout(searchTimeout);
              searchTimeout = setTimeout(() => {
                  const searchTerm = e.target.value.toLowerCase();
                  filterActivitiesBySearch(searchTerm);
              }, 300);
          });
      }
      
      // Set up quick action buttons
      const refreshBtn = document.getElementById('refresh-activities');
      if (refreshBtn) {
          refreshBtn.addEventListener('click', function() {
              this.disabled = true;
              this.innerHTML = '<span class="action-icon">⏳</span> Refreshing...';
              
              setTimeout(() => {
                  loadRecentActivities();
                  this.disabled = false;
                  this.innerHTML = '<span class="action-icon">🔄</span> Refresh';
                  showActivityFeedback('Activities refreshed successfully!', 'success');
              }, 1000);
          });
      }
      
      const statsBtn = document.getElementById('activity-stats');
      if (statsBtn) {
          statsBtn.addEventListener('click', showActivityStats);
      }
      
      const settingsBtn = document.getElementById('activity-settings');
      if (settingsBtn) {
          settingsBtn.addEventListener('click', showActivitySettings);
      }
      
      const clearBtn = document.getElementById('clear-activities');
      if (clearBtn) {
          clearBtn.addEventListener('click', function() {
              if (confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
                  clearAllActivities();
              }
          });
      }
  });
  
  // Achievement system
  function checkAchievements() {
      // Get user ID from either Firebase auth or URL parameters
      let userId = null;
      if (auth.currentUser) {
          userId = auth.currentUser.uid;
      } else if (typeof getUserIdFromURL === 'function') {
          userId = getUserIdFromURL();
      }
      
      // If no user ID available, use 'guest' as fallback
      if (!userId) {
          userId = 'guest';
      }
      const wins = parseInt(localStorage.getItem(`wins_${userId}`) || '0', 10);
      const handsPlayed = parseInt(localStorage.getItem(`handsPlayed_${userId}`) || '0', 10);
      const winRate = handsPlayed > 0 ? (wins / handsPlayed) * 100 : 0;
      
      // Load saved achievements
      loadAchievements();
      
      let newAchievements = [];
      
      // BRONZE TIER ACHIEVEMENTS
      // Check First Game
      if (handsPlayed >= 1 && !achievements['first-game'].unlocked) {
          unlockAchievement('first-game', 'First Game! You played your first hand!');
          newAchievements.push('first-game');
      }
      
      // Check First Win
      if (wins >= 1 && !achievements['first-win'].unlocked) {
          unlockAchievement('first-win', 'First Win! You won your first hand!');
          newAchievements.push('first-win');
      }
      
      // Check Small Bet
      if (maxBetInHand >= 25 && !achievements['small-bet'].unlocked) {
          unlockAchievement('small-bet', 'Small Bet! You bet 25+ chips in one hand!');
          newAchievements.push('small-bet');
      }
      
      // SILVER TIER ACHIEVEMENTS
      // Check Winning Streak
      if (consecutiveWins >= 4 && !achievements['winning-streak'].unlocked) {
          unlockAchievement('winning-streak', 'Hot Streak! You won 4 hands in a row!');
          newAchievements.push('winning-streak');
      }
      
      // Check Experienced
      if (handsPlayed >= 50 && !achievements['experienced'].unlocked) {
          unlockAchievement('experienced', 'Experienced! You\'ve played 50+ hands!');
          newAchievements.push('experienced');
      }
      
      // Check Medium Bet
      if (maxBetInHand >= 300 && !achievements['medium-bet'].unlocked) {
          unlockAchievement('medium-bet', 'Medium Bet! You bet 300+ chips in one hand!');
          newAchievements.push('medium-bet');
      }
      
      // Check River King (placeholder logic: needs actual tracking of river wins)
      if (typeof window.riverWins === 'number' && window.riverWins >= 1 && !achievements['river-king'].unlocked) {
          unlockAchievement('river-king', 'River King! You won with a river card!');
          newAchievements.push('river-king');
      }
      
      // GOLD TIER ACHIEVEMENTS
      // Check Veteran (150+ hands)
      if (handsPlayed >= 150 && !achievements['veteran'].unlocked) {
          unlockAchievement('veteran', 'Veteran! You\'ve played 150+ hands!');
          newAchievements.push('veteran');
      }
      
      // Check High Roller
      if (maxBetInHand >= 800 && !achievements['high-roller'].unlocked) {
          unlockAchievement('high-roller', 'High Roller! You bet 800+ chips in one hand!');
          newAchievements.push('high-roller');
      }
      
      // Check Winning Master
      if (wins >= 25 && !achievements['winning-master'].unlocked) {
          unlockAchievement('winning-master', 'Winning Master! You\'ve won 25+ hands!');
          newAchievements.push('winning-master');
      }
      
      // PLATINUM TIER ACHIEVEMENTS
      // Check Champion (75%+ win rate with 50+ hands)
      if (handsPlayed >= 50 && winRate >= 75 && !achievements['champion'].unlocked) {
          unlockAchievement('champion', 'Champion! You have a 75%+ win rate!');
          newAchievements.push('champion');
      }
      
      // Check Legend
      if (wins >= 75 && !achievements['legend'].unlocked) {
          unlockAchievement('legend', 'Legend! You\'ve won 75+ hands!');
          newAchievements.push('legend');
      }
      
      // Check Ultimate Streak
      if (consecutiveWins >= 8 && !achievements['ultimate-streak'].unlocked) {
          unlockAchievement('ultimate-streak', 'Ultimate Streak! You won 8 hands in a row!');
          newAchievements.push('ultimate-streak');
      }
      
      // Check Millionaire
      if (maxBetInHand >= 2000 && !achievements['millionaire'].unlocked) {
          unlockAchievement('millionaire', 'Millionaire! You bet 2000+ chips in one hand!');
          newAchievements.push('millionaire');
      }
      
      // Whale
      if (maxBetInHand >= 5000 && !achievements['whale'].unlocked) {
          unlockAchievement('whale', 'Whale! You bet 5000+ chips in one hand!');
          newAchievements.push('whale');
      }
      // Marathoner
      if (handsPlayed >= 500 && !achievements['marathoner'].unlocked) {
          unlockAchievement('marathoner', 'Marathoner! You played 500+ hands!');
          newAchievements.push('marathoner');
      }
      // Fold Master (placeholder logic: needs actual tracking of 10 folds in a row)
      if (typeof window.foldStreak === 'number' && window.foldStreak >= 10 && !achievements['fold-master'].unlocked) {
          unlockAchievement('fold-master', 'Fold Master! You folded 10 hands in a row!');
          newAchievements.push('fold-master');
      }
      // Collector
      const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
      if (unlockedCount >= 10 && !achievements['collector'].unlocked) {
          unlockAchievement('collector', 'Collector! You unlocked 10 achievements!');
          newAchievements.push('collector');
      }
      // All-rounder (placeholder logic: needs actual tracking of winning with every hand type)
      if (window.allHandTypesWon && window.allHandTypesWon === true && !achievements['all-rounder'].unlocked) {
          unlockAchievement('all-rounder', 'All-rounder! You won with every hand type!');
          newAchievements.push('all-rounder');
      }
      // Perfectionist
      if (unlockedCount === Object.keys(achievements).length - 1 && !achievements['perfectionist'].unlocked) {
          unlockAchievement('perfectionist', 'Perfectionist! You unlocked all other achievements!');
          newAchievements.push('perfectionist');
      }
      
      // RECOVERY PATH ACHIEVEMENTS
      // Check First Journal Entry
      console.log('[ACHIEVEMENT] Checking first-journal achievement:');
      console.log('  - window.hasJournalEntry:', window.hasJournalEntry);
      console.log('  - typeof window.hasJournalEntry:', typeof window.hasJournalEntry);
      console.log('  - achievements[first-journal].unlocked:', achievements['first-journal'].unlocked);
      
      if (typeof window.hasJournalEntry === 'boolean' && window.hasJournalEntry && !achievements['first-journal'].unlocked) {
          console.log('[ACHIEVEMENT] Unlocking first-journal achievement!');
          unlockAchievement('first-journal', 'First Journal Entry! You started your recovery journey with reflection!');
          newAchievements.push('first-journal');
      }
      
      // Check Fold Discipline (3 big hands in a row)
      if (typeof window.foldDisciplineStreak === 'number' && window.foldDisciplineStreak >= 3 && !achievements['fold-discipline'].unlocked) {
          unlockAchievement('fold-discipline', 'Discipline Master! You showed restraint in high-pressure moments!');
          newAchievements.push('fold-discipline');
      }
      
      // Check Week Without All-In (placeholder logic: needs actual tracking)
      if (typeof window.daysWithoutAllIn === 'number' && window.daysWithoutAllIn >= 7 && !achievements['week-without-allin'].unlocked) {
          unlockAchievement('week-without-allin', 'Steady Progress! You maintained control for a full week!');
          newAchievements.push('week-without-allin');
      }
      
      // Check Mindful Player (10 breaks during gameplay)
      if (typeof window.mindfulBreaks === 'number' && window.mindfulBreaks >= 10 && !achievements['mindful-player'].unlocked) {
          unlockAchievement('mindful-player', 'Mindful Master! You recognize when to step back and breathe!');
          newAchievements.push('mindful-player');
      }
      
      // Check Recovery Champion (complete Recovery Path)
      const recoveryAchievements = ['first-journal', 'fold-discipline', 'week-without-allin', 'mindful-player'];
      const recoveryUnlocked = recoveryAchievements.filter(id => achievements[id]?.unlocked).length;
      if (recoveryUnlocked === recoveryAchievements.length && !achievements['recovery-champion'].unlocked) {
          unlockAchievement('recovery-champion', 'Recovery Champion! You\'ve mastered mindful, disciplined play!');
          newAchievements.push('recovery-champion');
      }
      
      // Save achievements
      saveAchievements();
      
      // Show notification for new achievements
      if (newAchievements.length > 0) {
          showAchievementNotification(newAchievements);
      }
      
      // Update achievement display
      updateAchievementDisplay();
      
      // Update achievement progress indicators
      updateAchievementProgress();
  }
  
  function unlockAchievement(achievementId, message) {
      achievements[achievementId].unlocked = true;
      console.log(`[ACHIEVEMENT] Unlocked: ${achievementId}`);
      
      // Add to recent activities
      if (typeof window !== 'undefined' && window.addRecentActivity) {
          window.addRecentActivity(`🏆 ${message}`, 'achievement');
      }
  }
  
  function loadAchievements() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      
      try {
          // Load from Firebase
          const saved = localStorage.getItem(`achievements_${userId}`);
          if (saved) {
              const savedAchievements = JSON.parse(saved);
              
              // Update achievement states
              Object.keys(savedAchievements).forEach(achievementId => {
                  if (achievements[achievementId]) {
                      achievements[achievementId].unlocked = savedAchievements[achievementId].unlocked || false;
                  }
              });
          }
          
          // Also load from poker game's localStorage if available
          const pokerAchievements = localStorage.getItem(`achievements_${userId}`);
          if (pokerAchievements) {
              try {
                  const pokerData = JSON.parse(pokerAchievements);
                  
                  // Sync poker achievements with main app
                  Object.keys(pokerData).forEach(achievementId => {
                      if (achievements[achievementId]) {
                          achievements[achievementId].unlocked = pokerData[achievementId].unlocked || false;
                      }
                  });
              } catch (e) {
                  console.warn('Failed to parse poker achievements:', e);
              }
          }
          
          // Load tracking variables
          consecutiveWins = parseInt(localStorage.getItem(`consecutiveWins_${userId}`) || '0', 10);
          maxBetInHand = parseInt(localStorage.getItem(`maxBetInHand_${userId}`) || '0', 10);
          lowestChipsReached = parseInt(localStorage.getItem(`lowestChipsReached_${userId}`) || '1000', 10);
          
          // Load poker-specific tracking variables
          const foldStreak = parseInt(localStorage.getItem(`foldStreak_${userId}`) || '0', 10);
          const riverWins = parseInt(localStorage.getItem(`riverWins_${userId}`) || '0', 10);
          
          // Load RECOVERY PATH tracking variables
          window.foldDisciplineStreak = parseInt(localStorage.getItem(`foldDisciplineStreak_${userId}`) || '0', 10);
          window.daysWithoutAllIn = parseInt(localStorage.getItem(`daysWithoutAllIn_${userId}`) || '0', 10);
          window.mindfulBreaks = parseInt(localStorage.getItem(`mindfulBreaks_${userId}`) || '0', 10);
          
          // Update the display
          updateAchievementDisplay();
          updateAchievementProgress();
          
          console.log('[ACHIEVEMENT] Achievements loaded successfully');
          console.log('[ACHIEVEMENT] Recovery path variables:', {
              foldDisciplineStreak: window.foldDisciplineStreak,
              daysWithoutAllIn: window.daysWithoutAllIn,
              mindfulBreaks: window.mindfulBreaks
          });
      } catch (error) {
          console.error('[ACHIEVEMENT] Failed to load achievements:', error);
      }
  }
  
  function validateAchievements() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      const wins = parseInt(localStorage.getItem(`wins_${userId}`) || '0', 10);
      const handsPlayed = parseInt(localStorage.getItem(`handsPlayed_${userId}`) || '0', 10);
      const winRate = handsPlayed > 0 ? (wins / handsPlayed) * 100 : 0;
      
      let needsUpdate = false;
      const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
      Object.keys(achievements).forEach(achievementId => {
          const achievement = achievements[achievementId];
          if (achievement.unlocked) {
              let shouldBeUnlocked = false;
              switch (achievementId) {
                  case 'first-game':
                      shouldBeUnlocked = handsPlayed >= 1;
                      break;
                  case 'first-win':
                      shouldBeUnlocked = wins >= 1;
                      break;
                  case 'small-bet':
                      shouldBeUnlocked = maxBetInHand >= 25;
                      break;
                  case 'winning-streak':
                      shouldBeUnlocked = consecutiveWins >= 4;
                      break;
                  case 'experienced':
                      shouldBeUnlocked = handsPlayed >= 50;
                      break;
                  case 'medium-bet':
                      shouldBeUnlocked = maxBetInHand >= 300;
                      break;
                  case 'river-king':
                      shouldBeUnlocked = (typeof window.riverWins === 'number' && window.riverWins >= 1);
                      break;
                  case 'veteran':
                      shouldBeUnlocked = handsPlayed >= 150;
                      break;
                  case 'high-roller':
                      shouldBeUnlocked = maxBetInHand >= 800;
                      break;
                  case 'winning-master':
                      shouldBeUnlocked = wins >= 25;
                      break;
                  case 'champion':
                      shouldBeUnlocked = handsPlayed >= 50 && winRate >= 75;
                      break;
                  case 'legend':
                      shouldBeUnlocked = wins >= 75;
                      break;
                  case 'ultimate-streak':
                      shouldBeUnlocked = consecutiveWins >= 8;
                      break;
                  case 'millionaire':
                      shouldBeUnlocked = maxBetInHand >= 2000;
                      break;
                  case 'whale':
                      shouldBeUnlocked = maxBetInHand >= 5000;
                      break;
                  case 'marathoner':
                      shouldBeUnlocked = handsPlayed >= 500;
                      break;
                  case 'fold-master':
                      shouldBeUnlocked = (typeof window.foldStreak === 'number' && window.foldStreak >= 10);
                      break;
                  case 'collector':
                      shouldBeUnlocked = unlockedCount >= 10;
                      break;
                  case 'all-rounder':
                      shouldBeUnlocked = (window.allHandTypesWon && window.allHandTypesWon === true);
                      break;
                  case 'perfectionist':
                      shouldBeUnlocked = unlockedCount === Object.keys(achievements).length - 1;
                      break;
                  // Recovery Path achievements
                  case 'first-journal':
                      shouldBeUnlocked = (typeof window.hasJournalEntry === 'boolean' && window.hasJournalEntry);
                      break;
                  case 'fold-discipline':
                      shouldBeUnlocked = (typeof window.foldDisciplineStreak === 'number' && window.foldDisciplineStreak >= 3);
                      break;
                  case 'week-without-allin':
                      shouldBeUnlocked = (typeof window.daysWithoutAllIn === 'number' && window.daysWithoutAllIn >= 7);
                      break;
                  case 'mindful-player':
                      shouldBeUnlocked = (typeof window.mindfulBreaks === 'number' && window.mindfulBreaks >= 10);
                      break;
                  case 'recovery-champion':
                      const recoveryAchievements = ['first-journal', 'fold-discipline', 'week-without-allin', 'mindful-player'];
                      const recoveryUnlocked = recoveryAchievements.filter(id => achievements[id]?.unlocked).length;
                      shouldBeUnlocked = recoveryUnlocked === recoveryAchievements.length;
                      break;
              }
              if (!shouldBeUnlocked) {
                  achievement.unlocked = false;
                  needsUpdate = true;
                  console.log(`[ACHIEVEMENT] Re-locked: ${achievementId} - requirements not met`);
              }
          }
      });
      
      if (needsUpdate) {
          saveAchievements();
          updateAchievementDisplay();
          console.log('[ACHIEVEMENT] Achievements validated and updated');
      }
  }
  
  function saveAchievements() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      
      try {
          // Save to main app format
          const achievementData = {};
          Object.keys(achievements).forEach(key => {
              achievementData[key] = {
                  unlocked: achievements[key].unlocked,
                  unlockedAt: achievements[key].unlocked ? Date.now() : null
              };
          });
          
          localStorage.setItem(`achievements_${userId}`, JSON.stringify(achievementData));
          
          // Also save to poker game format for synchronization
          const pokerAchievementData = {};
          Object.keys(achievements).forEach(key => {
              if (achievements[key].unlocked) {
                  pokerAchievementData[key] = {
                      unlocked: true,
                      unlockedAt: Date.now()
                  };
              }
          });
          
          // Merge with existing poker achievements
          const existingPokerAchievements = localStorage.getItem(`achievements_${userId}`);
          if (existingPokerAchievements) {
              try {
                  const existing = JSON.parse(existingPokerAchievements);
                  const merged = { ...existing, ...pokerAchievementData };
                  localStorage.setItem(`achievements_${userId}`, JSON.stringify(merged));
              } catch (e) {
                  localStorage.setItem(`achievements_${userId}`, JSON.stringify(pokerAchievementData));
              }
          } else {
              localStorage.setItem(`achievements_${userId}`, JSON.stringify(pokerAchievementData));
          }
          
          console.log('[ACHIEVEMENT] Achievements saved successfully');
      } catch (error) {
          console.error('[ACHIEVEMENT] Failed to save achievements:', error);
      }
  }
  
  function resetAchievements() {
      if (!auth.currentUser) return;
      
      // Reset all achievements to locked
      Object.keys(achievements).forEach(key => {
          achievements[key].unlocked = false;
      });
      
      // Save and update display
      saveAchievements();
      updateAchievementDisplay();
      console.log('[ACHIEVEMENT] All achievements reset to locked');
  }
  
  function updateAchievementDisplay() {
      // Update all achievement badges
      Object.keys(achievements).forEach(achievementId => {
          const badge = document.querySelector(`[data-achievement="${achievementId}"]`);
          if (badge) {
              if (achievements[achievementId].unlocked) {
                  badge.classList.add('unlocked');
              } else {
                  badge.classList.remove('unlocked');
              }
          }
      });
      
      // Update tier completion status
      updateTierCompletion();
  }
  
  function updateTierCompletion() {
      const categories = {
          'betting': ['small-bet', 'medium-bet', 'high-roller', 'millionaire', 'whale'],
          'winning': ['first-win', 'winning-streak', 'winning-master', 'legend', 'ultimate-streak'],
          'experience': ['first-game', 'experienced', 'veteran', 'champion', 'marathoner'],
          'special': ['river-king', 'fold-master', 'collector', 'all-rounder', 'perfectionist'],
          'recovery': ['first-journal', 'fold-discipline', 'week-without-allin', 'mindful-player', 'recovery-champion']
      };
      
      Object.keys(categories).forEach(category => {
          const categoryAchievements = categories[category];
          const unlockedCount = categoryAchievements.filter(id => achievements[id]?.unlocked).length;
          const totalCount = categoryAchievements.length;
          const header = document.querySelector(`.${category}-header`);
          
          if (header) {
              const completionText = ` (${unlockedCount}/${totalCount})`;
              if (!header.textContent.includes('(')) {
                  header.textContent += completionText;
              } else {
                  header.textContent = header.textContent.replace(/\(\d+\/\d+\)/, completionText);
              }
              
              // Add completion glow effect
              if (unlockedCount === totalCount) {
                  header.style.boxShadow = `0 0 20px ${getCategoryColor(category)}`;
                  header.style.animation = 'tierComplete 2s ease-in-out infinite';
              } else {
                  header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
                  header.style.animation = 'none';
              }
          }
      });
  }
  
  function getCategoryColor(category) {
      const colors = {
          'betting': 'rgba(74, 222, 128, 0.8)',
          'winning': 'rgba(245, 158, 11, 0.8)',
          'experience': 'rgba(59, 130, 246, 0.8)',
          'special': 'rgba(168, 85, 247, 0.8)',
          'recovery': 'rgba(34, 197, 94, 0.8)'
      };
      return colors[category] || 'rgba(255, 215, 0, 0.8)';
  }
  
  function showAchievementNotification(achievementIds) {
      achievementIds.forEach(id => {
          const achievement = achievements[id];
          if (achievement) {
              // Create a temporary notification
              const notification = document.createElement('div');
              notification.className = 'achievement-notification';
              notification.innerHTML = `
                  <div class="notification-content">
                      <span class="notification-icon">🏆</span>
                      <div class="notification-text">
                          <div class="notification-title">Achievement Unlocked!</div>
                          <div class="notification-message">${achievement.condition}</div>
                          <div class="notification-description">${achievement.description}</div>
                      </div>
                  </div>
              `;
              
              document.body.appendChild(notification);
              
              // Remove after animation
              setTimeout(() => {
                  if (notification.parentNode) {
                      notification.parentNode.removeChild(notification);
                  }
              }, 5000); // Increased time to read the description
          }
      });
  }
  
  // Track game events for achievements
  function trackGameEvent(eventType, data = {}) {
      // Get user ID from either Firebase auth or URL parameters
      let userId = null;
      if (auth.currentUser) {
          userId = auth.currentUser.uid;
      } else if (typeof getUserIdFromURL === 'function') {
          userId = getUserIdFromURL();
      }
      
      // If no user ID available, use 'guest' as fallback
      if (!userId) {
          userId = 'guest';
      }
      
      switch (eventType) {
          case 'win':
              consecutiveWins++;
              // Save to localStorage
              localStorage.setItem(`consecutiveWins_${userId}`, consecutiveWins);
              updateStreakDisplay();
              if (data.chipsWon) {
                  // Track if this was a comeback
                  const currentChips = parseInt(userChips.textContent) || 1000;
                  if (currentChips < lowestChipsReached) {
                      lowestChipsReached = currentChips;
                      localStorage.setItem(`lowestChipsReached_${userId}`, lowestChipsReached);
                  }
              }
              break;
          case 'loss':
              consecutiveWins = 0;
              // Save to localStorage
              localStorage.setItem(`consecutiveWins_${userId}`, consecutiveWins);
              updateStreakDisplay();
              break;
          case 'bet':
              if (data.amount > maxBetInHand) {
                  maxBetInHand = data.amount;
                  // Save to localStorage
                  localStorage.setItem(`maxBetInHand_${userId}`, maxBetInHand);
                  console.log(`[ACHIEVEMENT] New max bet recorded: $${maxBetInHand}`);
              }
              break;
          case 'chips-low':
              if (data.chips < lowestChipsReached) {
                  lowestChipsReached = data.chips;
                  localStorage.setItem(`lowestChipsReached_${userId}`, lowestChipsReached);
              }
              break;
      }
      
      checkAchievements();
  }
  
  // Update achievement progress indicators
  function updateAchievementProgress() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      const wins = parseInt(localStorage.getItem(`wins_${userId}`) || '0', 10);
      const handsPlayed = parseInt(localStorage.getItem(`handsPlayed_${userId}`) || '0', 10);
      const winRate = handsPlayed > 0 ? (wins / handsPlayed) * 100 : 0;
      
      // Update Veteran Progress (150 hands)
      const veteranProgress = Math.min((handsPlayed / 150) * 100, 100);
      const veteranFill = document.getElementById('veteran-progress');
      const veteranText = document.getElementById('veteran-text');
      if (veteranFill && veteranText) {
          veteranFill.style.width = `${veteranProgress}%`;
          veteranText.textContent = `${handsPlayed}/150 hands`;
      }
      
      // Update Champion Progress (75% win rate with 50+ hands)
      let championProgress = 0;
      if (handsPlayed >= 50) {
          championProgress = Math.min((winRate / 75) * 100, 100);
      } else {
          championProgress = (handsPlayed / 50) * 100;
      }
      const championFill = document.getElementById('champion-progress');
      const championText = document.getElementById('champion-text');
      if (championFill && championText) {
          championFill.style.width = `${championProgress}%`;
          championText.textContent = `${Math.round(winRate)}% win rate`;
      }
      
      // Update Hot Streak Progress (4 consecutive wins)
      const streakProgress = Math.min((consecutiveWins / 4) * 100, 100);
      const streakFill = document.getElementById('streak-progress');
      const streakText = document.getElementById('streak-text');
      if (streakFill && streakText) {
          streakFill.style.width = `${streakProgress}%`;
          streakText.textContent = `${consecutiveWins}/4 wins`;
      }
      
      // Update Legend Progress (75 wins)
      const legendProgress = Math.min((wins / 75) * 100, 100);
      const legendFill = document.getElementById('legend-progress');
      const legendText = document.getElementById('legend-text');
      if (legendFill && legendText) {
          legendFill.style.width = `${legendProgress}%`;
          legendText.textContent = `${wins}/75 wins`;
      }
      
      // Update Ultimate Streak Progress (8 consecutive wins)
      const ultimateStreakProgress = Math.min((consecutiveWins / 8) * 100, 100);
      const ultimateStreakFill = document.getElementById('ultimate-streak-progress');
      const ultimateStreakText = document.getElementById('ultimate-streak-text');
      if (ultimateStreakFill && ultimateStreakText) {
          ultimateStreakFill.style.width = `${ultimateStreakProgress}%`;
          ultimateStreakText.textContent = `${consecutiveWins}/8 wins`;
      }
  }
  
  // Update current streak display
  function updateStreakDisplay() {
      const streakElement = document.getElementById('user-streak');
      if (streakElement) {
          streakElement.textContent = consecutiveWins;
          if (consecutiveWins >= 3) {
              streakElement.classList.add('hot-streak');
          } else {
              streakElement.classList.remove('hot-streak');
          }
      }
  }
  
  // Show detailed achievement information
  function showAchievementDetails(achievementId) {
      const achievement = achievements[achievementId];
      if (!achievement) return;
      
      // Create modal for achievement details
      const modal = document.createElement('div');
      modal.className = 'achievement-modal modal';
      modal.innerHTML = `
          <div class="modal-content achievement-modal-content">
              <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
              <div class="achievement-detail-header">
                  <span class="achievement-detail-icon">${getAchievementIcon(achievementId)}</span>
                  <div class="achievement-detail-info">
                      <h3 class="achievement-detail-title">${getAchievementTitle(achievementId)}</h3>
                      <div class="achievement-detail-status ${achievement.unlocked ? 'unlocked' : 'locked'}">
                          ${achievement.unlocked ? '🏆 Unlocked' : '🔒 Locked'}
                      </div>
                  </div>
              </div>
              <div class="achievement-detail-body">
                  <div class="achievement-detail-description">
                      <h4>Description</h4>
                      <p>${achievement.description}</p>
                  </div>
                  <div class="achievement-detail-requirement">
                      <h4>Requirement</h4>
                      <p>${achievement.requirement}</p>
                  </div>
                  ${achievement.tooltip ? `
                  <div class="achievement-detail-tooltip">
                      <h4>Why This Matters</h4>
                      <p>${achievement.tooltip}</p>
                  </div>
                  ` : ''}
                  ${achievement.unlocked ? `
                  <div class="achievement-detail-unlocked">
                      <h4>Unlocked</h4>
                      <p>You earned this achievement by ${achievement.condition.toLowerCase()}!</p>
                  </div>
                  ` : `
                  <div class="achievement-detail-progress">
                      <h4>Progress</h4>
                      <p>${getAchievementProgress(achievementId)}</p>
                  </div>
                  `}
              </div>
          </div>
      `;
      
      document.body.appendChild(modal);
      
      // Remove modal when clicking outside
      modal.addEventListener('click', (e) => {
          if (e.target === modal) {
              modal.remove();
          }
      });
  }
  
  // Helper functions for achievement details
  function getAchievementIcon(achievementId) {
      const icons = {
          'first-game': '🎮',
          'first-win': '🥇',
          'small-bet': '💎',
          'winning-streak': '🔥',
          'experienced': '📚',
          'medium-bet': '💎💎',
          'river-king': '🌊',
          'veteran': '🎖️',
          'high-roller': '💰',
          'winning-master': '🏆',
          'champion': '👑',
          'legend': '🌟',
          'ultimate-streak': '🔥🔥',
          'millionaire': '💎💎💎',
          'whale': '🐋',
          'marathoner': '🏃',
          'fold-master': '🎯',
          'collector': '📦',
          'all-rounder': '🃏',
          'perfectionist': '✨',
          // Recovery Path achievements
          'first-journal': '📝',
          'fold-discipline': '🧘',
          'week-without-allin': '📅',
          'mindful-player': '🧠',
          'recovery-champion': '💚'
      };
      return icons[achievementId] || '🏆';
  }
  
  function getAchievementTitle(achievementId) {
      const titles = {
          'first-game': 'First Game',
          'first-win': 'First Win',
          'small-bet': 'Small Bet',
          'winning-streak': 'Hot Streak',
          'experienced': 'Experienced',
          'medium-bet': 'Medium Bet',
          'river-king': 'River King',
          'veteran': 'Veteran',
          'high-roller': 'High Roller',
          'winning-master': 'Winning Master',
          'champion': 'Champion',
          'legend': 'Legend',
          'ultimate-streak': 'Ultimate Streak',
          'millionaire': 'Millionaire',
          'whale': 'Whale',
          'marathoner': 'Marathoner',
          'fold-master': 'Fold Master',
          'collector': 'Collector',
          'all-rounder': 'All-rounder',
          'perfectionist': 'Perfectionist',
          // Recovery Path achievements
          'first-journal': 'First Journal Entry',
          'fold-discipline': 'Discipline Master',
          'week-without-allin': 'Steady Progress',
          'mindful-player': 'Mindful Master',
          'recovery-champion': 'Recovery Champion'
      };
      return titles[achievementId] || 'Achievement';
  }
  
  function getAchievementProgress(achievementId) {
      if (!auth.currentUser) return 'Sign in to track progress';
      
      const userId = auth.currentUser.uid;
      const wins = parseInt(localStorage.getItem(`wins_${userId}`) || '0', 10);
      const handsPlayed = parseInt(localStorage.getItem(`handsPlayed_${userId}`) || '0', 10);
      const winRate = handsPlayed > 0 ? (wins / handsPlayed) * 100 : 0;
      
      switch (achievementId) {
          // BRONZE TIER
          case 'first-game':
              return handsPlayed >= 1 ? 'Complete!' : `Play your first hand (${handsPlayed}/1)`;
          case 'first-win':
              return wins >= 1 ? 'Complete!' : `Win your first hand (${wins}/1)`;
          case 'small-bet':
              return maxBetInHand >= 25 ? 'Complete!' : `Bet 25+ chips (max: ${maxBetInHand})`;
          case 'medium-bet':
              return maxBetInHand >= 300 ? 'Complete!' : `Bet 300+ chips (max: ${maxBetInHand})`;
          case 'high-roller':
              return maxBetInHand >= 800 ? 'Complete!' : `Bet 800+ chips (max: ${maxBetInHand})`;
          case 'millionaire':
              return maxBetInHand >= 2000 ? 'Complete!' : `Bet 2000+ chips (max: ${maxBetInHand})`;
          case 'whale':
              return maxBetInHand >= 5000 ? 'Complete!' : `Bet 5000+ chips (max: ${maxBetInHand})`;
          case 'winning-streak':
              return consecutiveWins >= 4 ? 'Complete!' : `Win 4 in a row (${consecutiveWins}/4)`;
          case 'winning-master':
              return wins >= 25 ? 'Complete!' : `Win 25 hands (${wins}/25)`;
          case 'legend':
              return wins >= 75 ? 'Complete!' : `Win 75 hands (${wins}/75)`;
          case 'ultimate-streak':
              return consecutiveWins >= 8 ? 'Complete!' : `Win 8 in a row (${consecutiveWins}/8)`;
          case 'experienced':
              return handsPlayed >= 50 ? 'Complete!' : `Play 50 hands (${handsPlayed}/50)`;
          case 'veteran':
              return handsPlayed >= 150 ? 'Complete!' : `Play 150 hands (${handsPlayed}/150)`;
          case 'champion':
              if (handsPlayed < 50) {
                  return `Play 50 hands first (${handsPlayed}/50)`;
              }
              return winRate >= 75 ? 'Complete!' : `Achieve 75% win rate (${Math.round(winRate)}%/75%)`;
          case 'marathoner':
              return handsPlayed >= 500 ? 'Complete!' : `Play 500 hands (${handsPlayed}/500)`;
          case 'river-king':
              const riverWins = window.riverWins || 0;
              return riverWins >= 1 ? 'Complete!' : `Win with a river card (current: ${riverWins}/1)`;
          case 'fold-master':
              const foldStreak = window.foldStreak || 0;
              return foldStreak >= 10 ? 'Complete!' : `Fold 10 hands in a row (current: ${foldStreak}/10)`;
          case 'collector':
              return unlockedCount >= 10 ? 'Complete!' : `Unlock 10 achievements (${unlockedCount}/10)`;
          case 'all-rounder':
              const allHandTypes = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush','Royal Flush'];
              const wonTypes = window.handTypesWon || {};
              const wonCount = allHandTypes.filter(type => wonTypes[type]).length;
              if (wonCount === allHandTypes.length) return 'Complete!';
              return `Win with every hand type (${wonCount}/${allHandTypes.length}): ` + allHandTypes.filter(type => !wonTypes[type]).join(', ');
          case 'perfectionist':
              return unlockedCount === Object.keys(achievements).length - 1 ? 'Complete!' : `Unlock all other achievements (${unlockedCount}/${Object.keys(achievements).length - 1})`;
          // Recovery Path achievements
          case 'first-journal':
              const hasJournal = window.hasJournalEntry || false;
              return hasJournal ? 'Complete!' : 'Write your first journal entry';
          case 'fold-discipline':
              const foldDiscipline = window.foldDisciplineStreak || 0;
              return foldDiscipline >= 3 ? 'Complete!' : `Fold 3 big hands in a row (${foldDiscipline}/3)`;
          case 'week-without-allin':
              const daysWithoutAllIn = window.daysWithoutAllIn || 0;
              return daysWithoutAllIn >= 7 ? 'Complete!' : `Play 7 days without all-in (${daysWithoutAllIn}/7)`;
          case 'mindful-player':
              const mindfulBreaks = window.mindfulBreaks || 0;
              return mindfulBreaks >= 10 ? 'Complete!' : `Take 10 mindful breaks (${mindfulBreaks}/10)`;
          case 'recovery-champion':
              const recoveryAchievements = ['first-journal', 'fold-discipline', 'week-without-allin', 'mindful-player'];
              const recoveryUnlocked = recoveryAchievements.filter(id => achievements[id]?.unlocked).length;
              return recoveryUnlocked === recoveryAchievements.length ? 'Complete!' : `Complete Recovery Path (${recoveryUnlocked}/${recoveryAchievements.length})`;
          default:
              return 'Progress tracking not available';
      }
  }
  
  // Add click event listeners to achievement badges
  function setupAchievementClickListeners() {
      const badges = document.querySelectorAll('.achievement-badge');
      badges.forEach(badge => {
          badge.addEventListener('click', () => {
              const achievementId = badge.getAttribute('data-achievement');
              if (achievementId) {
                  showAchievementDetails(achievementId);
              }
          });
      });
  }
  
  // === Achievements Modal Logic ===
  document.addEventListener('DOMContentLoaded', function() {
      const viewAchievementsBtn = document.getElementById('view-achievements-btn');
      const achievementsModal = document.getElementById('achievements-modal');
      const closeAchievementsModal = document.getElementById('close-achievements-modal');
      if (viewAchievementsBtn && achievementsModal && closeAchievementsModal) {
          viewAchievementsBtn.addEventListener('click', function() {
              achievementsModal.classList.remove('hidden');
          });
          closeAchievementsModal.addEventListener('click', function() {
              achievementsModal.classList.add('hidden');
          });
          // Close modal on Escape key
          document.addEventListener('keydown', function(e) {
              if (!achievementsModal.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Esc')) {
                  achievementsModal.classList.add('hidden');
              }
          });
          // Optional: close modal if clicking outside modal content
          achievementsModal.addEventListener('click', function(e) {
              if (e.target === achievementsModal) {
                  achievementsModal.classList.add('hidden');
              }
          });
      }
  });
  
  // === Achievements Screen Logic ===
  document.addEventListener('DOMContentLoaded', function() {
      const viewAchievementsBtn = document.getElementById('view-achievements-btn');
      const achievementsScreen = document.getElementById('achievements-screen');
      const closeAchievementsScreen = document.getElementById('close-achievements-screen');
      const gameInterface = document.getElementById('game-interface');
      if (viewAchievementsBtn && achievementsScreen && closeAchievementsScreen && gameInterface) {
          viewAchievementsBtn.addEventListener('click', function() {
              gameInterface.classList.add('hidden');
              achievementsScreen.classList.remove('hidden');
              
              // Load latest achievements when screen is opened
              loadAchievements();
              setupAchievementClickListeners();
              
              // Force check achievements when achievements screen is opened
              console.log('[ACHIEVEMENT] Achievements screen opened, checking achievements...');
              checkAchievements();
          });
          closeAchievementsScreen.addEventListener('click', function() {
              // Always return to profile (game interface)
              achievementsScreen.classList.add('hidden');
              gameInterface.classList.remove('hidden');
          });
          // Close achievements screen on Escape key
          document.addEventListener('keydown', function(e) {
              if (!achievementsScreen.classList.contains('hidden') && (e.key === 'Escape' || e.key === 'Esc')) {
                  achievementsScreen.classList.add('hidden');
                  gameInterface.classList.remove('hidden');
              }
          });
      }
  });
  
  // After user is authenticated and UI is updated, set the Start New Game button href with user ID and username
  function updateStartGameButtonHref() {
    const startGameBtn = document.querySelector('a[href^="poker_index.html"]');
    if (startGameBtn && auth.currentUser) {
      // Get username from profile display or user object
      let username = 'Player';
      const userDisplayName = document.getElementById('user-display-name');
      if (userDisplayName && userDisplayName.textContent) {
        username = userDisplayName.textContent.trim();
      } else if (auth.currentUser.displayName) {
        username = auth.currentUser.displayName;
      }
      startGameBtn.href = `poker_index.html?user=${auth.currentUser.uid}&username=${encodeURIComponent(username)}`;
    }
  }
  
  // Call this after login and UI update
  // For example, inside the auth.onAuthStateChanged(user) block, after showing the game interface:
  updateStartGameButtonHref();
  
  // ... existing code ...
  window.updateHandsPlayedDisplay = updateHandsPlayedDisplay;
  window.updateWinsDisplay = updateWinsDisplay;
  window.updateLossesDisplay = updateLossesDisplay;
  window.updateWinRate = updateWinRate;
  window.updateStreakDisplay = updateStreakDisplay;
  // ... existing code ...

  // --- LOCKOUT OVERLAY LOGIC ---
  function showLockoutOverlay() {
    const overlay = document.getElementById('lockout-overlay');
    const gameInterface = document.getElementById('game-interface');
    if (overlay) overlay.classList.remove('hidden');
    if (gameInterface) gameInterface.classList.add('hidden');
  }
  function hideLockoutOverlay() {
    const overlay = document.getElementById('lockout-overlay');
    const gameInterface = document.getElementById('game-interface');
    if (overlay) overlay.classList.add('hidden');
    if (gameInterface) gameInterface.classList.remove('hidden');
  }
  window.addEventListener('DOMContentLoaded', function() {
    const returnBtn = document.getElementById('return-main-menu-btn');
    if (returnBtn) {
      returnBtn.onclick = hideLockoutOverlay;
    }
  });
  // --- END LOCKOUT OVERLAY LOGIC ---

  // --- Patch start game button logic to show overlay instead of just disabling ---
  function updateStartGameButtonText() {
      const startGameBtn = document.getElementById('start-game-btn');
      if (startGameBtn) {
          let sessionEnded = false;
          const userId = auth.currentUser ? auth.currentUser.uid : null;
          if (userId) {
              const endedTimestamp = localStorage.getItem(`sessionEnded_${userId}`);
              if (endedTimestamp) {
                  const now = Date.now();
                  if (now - parseInt(endedTimestamp, 10) < 3600000) {
                      sessionEnded = true;
                  }
              }
          }
          if (localStorage.getItem('hasEverStartedGame') === 'true' || (userId && localStorage.getItem(`hasOngoingGame_${userId}`) === 'true')) {
              startGameBtn.textContent = '🎲 Continue Game';
          } else {
              startGameBtn.textContent = '🎲 Start New Game';
          }
          startGameBtn.disabled = false;
          if (sessionEnded) {
              startGameBtn.textContent = 'Come back in an hour to continue';
              startGameBtn.onclick = showLockoutOverlay;
          } else {
              startGameBtn.onclick = null;
          }
      }
  }
  // ... existing code ...
  // Ensure progress bars update on DOMContentLoaded and after achievement changes
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof updateAchievementCategoryProgress === 'function') updateAchievementCategoryProgress();
  });
  // In checkAchievements, unlockAchievement, loadAchievements, and after login, call updateAchievementCategoryProgress();
  // ... existing code ...

  // After user login or on app load, set window.hasJournalEntry from localStorage
  window.addEventListener('DOMContentLoaded', function() {
    const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth && auth.currentUser ? auth.currentUser.uid : 'guest'));
    window.hasJournalEntry = localStorage.getItem(`hasJournalEntry_${userId}`) === 'true';
    
    // Also check if user already has journal entries and set the flag
    const journalKey = `journalEntries_${userId}`;
    const existingEntries = JSON.parse(localStorage.getItem(journalKey) || '[]');
    if (existingEntries.length > 0) {
      window.hasJournalEntry = true;
      localStorage.setItem(`hasJournalEntry_${userId}`, 'true');
      console.log('[ACHIEVEMENT] Found existing journal entries, setting hasJournalEntry = true');
    }
    
    // Check for journal achievement on app load
    if (auth && auth.currentUser) {
      checkJournalAchievement();
    }
  });

  // Function to sync recovery path variables from poker game
  function syncRecoveryPathVariables() {
    const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth && auth.currentUser ? auth.currentUser.uid : 'guest'));
    
    // Load recovery path variables from localStorage
    window.foldDisciplineStreak = parseInt(localStorage.getItem(`foldDisciplineStreak_${userId}`) || '0', 10);
    window.daysWithoutAllIn = parseInt(localStorage.getItem(`daysWithoutAllIn_${userId}`) || '0', 10);
    window.mindfulBreaks = parseInt(localStorage.getItem(`mindfulBreaks_${userId}`) || '0', 10);
    
    console.log('[ACHIEVEMENT] Synced recovery path variables:', {
      foldDisciplineStreak: window.foldDisciplineStreak,
      daysWithoutAllIn: window.daysWithoutAllIn,
      mindfulBreaks: window.mindfulBreaks
    });
  }

  // Debug function to check achievement variables
  window.debugAchievementVariables = function() {
      console.log('=== ACHIEVEMENT DEBUG ===');
      const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth && auth.currentUser ? auth.currentUser.uid : 'guest'));
      console.log('User ID:', userId);
      console.log('window.hasJournalEntry:', window.hasJournalEntry);
      console.log('localStorage hasJournalEntry:', localStorage.getItem(`hasJournalEntry_${userId}`));
      
      // Check journal entries
      const journalKey = `journalEntries_${userId}`;
      const journalEntries = JSON.parse(localStorage.getItem(journalKey) || '[]');
      console.log('Journal entries count:', journalEntries.length);
      console.log('Journal entries:', journalEntries);
      
      // Check achievement status
      console.log('first-journal achievement unlocked:', achievements['first-journal']?.unlocked);
      
      // Check if checkAchievements function exists
      console.log('checkAchievements function exists:', typeof checkAchievements === 'function');
      
      // Force set hasJournalEntry if journal entries exist
      if (journalEntries.length > 0) {
          window.hasJournalEntry = true;
          localStorage.setItem(`hasJournalEntry_${userId}`, 'true');
          console.log('Set hasJournalEntry to true because journal entries exist');
      }
      
      console.log('=== END DEBUG ===');
  };

  // Manual trigger to unlock first-journal achievement (for testing)
  window.forceUnlockFirstJournal = function() {
      console.log('=== FORCE UNLOCKING FIRST JOURNAL ACHIEVEMENT ===');
      const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth && auth.currentUser ? auth.currentUser.uid : 'guest'));
      
      // Set the variables
      window.hasJournalEntry = true;
      localStorage.setItem(`hasJournalEntry_${userId}`, 'true');
      
      // Force unlock the achievement
      if (achievements['first-journal']) {
          achievements['first-journal'].unlocked = true;
          console.log('Achievement unlocked!');
          
          // Save achievements
          saveAchievements();
          
          // Update display
          updateAchievementDisplay();
          
          // Show notification
          showAchievementNotification(['first-journal']);
          
          console.log('First Journal achievement should now be unlocked!');
      } else {
          console.log('Achievement not found!');
      }
  };

  // Test function to manually trigger recovery path achievements
  window.testRecoveryPathAchievements = function() {
      console.log('=== TESTING RECOVERY PATH ACHIEVEMENTS ===');
      const userId = (typeof getCurrentUserId === 'function' ? getCurrentUserId() : (auth && auth.currentUser ? auth.currentUser.uid : 'guest'));
      
      // Test fold discipline
      window.foldDisciplineStreak = 3;
      localStorage.setItem(`foldDisciplineStreak_${userId}`, '3');
      
      // Test days without all-in
      window.daysWithoutAllIn = 7;
      localStorage.setItem(`daysWithoutAllIn_${userId}`, '7');
      
      // Test mindful breaks
      window.mindfulBreaks = 10;
      localStorage.setItem(`mindfulBreaks_${userId}`, '10');
      
      // Test first journal
      window.hasJournalEntry = true;
      localStorage.setItem(`hasJournalEntry_${userId}`, 'true');
      
      console.log('Recovery path variables set for testing:', {
          foldDisciplineStreak: window.foldDisciplineStreak,
          daysWithoutAllIn: window.daysWithoutAllIn,
          mindfulBreaks: window.mindfulBreaks,
          hasJournalEntry: window.hasJournalEntry
      });
      
      // Check achievements
      if (typeof checkAchievements === 'function') {
          checkAchievements();
      }
      
      console.log('Recovery path achievements should now be unlocked!');
  };

  // Check for journal achievement
  function checkJournalAchievement() {
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      const journalKey = `journalEntries_${userId}`;
      const hasJournalEntryFlag = localStorage.getItem(`hasJournalEntry_${userId}`);
      
      // Check if user has journal entries
      const journalEntries = JSON.parse(localStorage.getItem(journalKey) || '[]');
      const hasJournalEntries = journalEntries.length > 0;
      
      console.log('[ACHIEVEMENT] Checking journal achievement:');
      console.log('  - hasJournalEntries:', hasJournalEntries);
      console.log('  - hasJournalEntryFlag:', hasJournalEntryFlag);
      console.log('  - current achievement unlocked:', achievements['first-journal']?.unlocked);
      
      // Set the global flag
      window.hasJournalEntry = hasJournalEntries;
      
      // If user has journal entries but achievement is not unlocked, unlock it
      if (hasJournalEntries && !achievements['first-journal'].unlocked) {
          console.log('[ACHIEVEMENT] Unlocking first-journal achievement!');
          unlockAchievement('first-journal', 'First Journal Entry! You started your recovery journey with reflection!');
          saveAchievements();
          updateAchievementDisplay();
          showAchievementNotification(['first-journal']);
      }
  }

  // Manual trigger to test journal achievement (for testing)
  window.testJournalAchievement = function() {
      console.log('=== TESTING JOURNAL ACHIEVEMENT ===');
      checkJournalAchievement();
  };