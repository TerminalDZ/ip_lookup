const users = [];

$(document).ready(function() {
   loadUsers();
   
   $('#loginButton').on('click', loginUser);
   $('#registerButton').on('click', registerUser);
   $('#logoutButton').on('click', logoutUser);
   
   let inputTimer;

   $('#ipInput').on('input', function() {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(fetchIPInfo, 1000);
   });

   const currentUser = getCurrentUser();
   if (currentUser) {
      handleSuccessfulLogin(currentUser);
   }
});

async function loadUsers() {
   try {
      const response = await $.getJSON('users.json');
      users.push(...response);
   } catch (error) {
      console.error('Error loading users:', error);
   }
}

function loginUser() {
   const username = $('#username').val();
   const password = $('#password').val();
   const user = users.find(u => u.username === username && u.password === password);

   if (user) {
      handleSuccessfulLogin(user);
   } else {
      showError('Invalid username or password.');
   }
}

function registerUser() {
   const username = $('#username').val();
   const password = $('#password').val();
   
   if (username && password) {
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
         showError('Username already exists.');
         return;
      }
      
      const newUser = {
         id: (users.length + 1).toString(),
         username: username,
         password: password,
         history: []
      };

      users.push(newUser);
      saveUsersToStorage();
      handleSuccessfulLogin(newUser);
   } else {
      showError('Username and password are required.');
   }
}

function logoutUser() {
   sessionStorage.removeItem('currentUser');
   resetForms();
}

async function fetchIPInfo() {
   const ip = $('#ipInput').val();
   if (ip) {
      try {
         const response = await $.getJSON(`http://ip-api.com/json/${ip}`);
         if (response.status === 'success') {
            updateHistory(ip);
            displayIPInfo(response);
         } else {
            showError('IP information retrieval was not successful.');
         }
      } catch (error) {
         showError('An error occurred while fetching IP information.');
      }
   }
}

function handleSuccessfulLogin(user) {
   hideForms(['loginForm']);
   showForms(['ipForm', 'history']);
   
   sessionStorage.setItem('currentUser', JSON.stringify(user));
   displayHistory(user.history);
}

function displayHistory(history) {
   const historyHTML = history.map((ip, index) => `<p>${index + 1}. ${ip}</p>`).join('');
   $('#history').html(`<h3>Search History:</h3>${historyHTML}`);
}

function updateHistory(ip) {
   const currentUser = getCurrentUser();
   if (currentUser) {
      currentUser.history.push(ip);
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      displayHistory(currentUser.history);
   }
}

function getCurrentUser() {
   return JSON.parse(sessionStorage.getItem('currentUser'));
}

function displayIPInfo(ipInfo) {
   if (ipInfo.status === 'success') {
      const ipInfoHTML = `
      <p><strong>Country:</strong> ${ipInfo.country}</p>
      <p><strong>City:</strong> ${ipInfo.city}</p>
      <p><strong>Region:</strong> ${ipInfo.regionName}</p>
      <p><strong>ZIP Code:</strong> ${ipInfo.zip}</p>
      <p><strong>Latitude:</strong> ${ipInfo.lat}</p>
      <p><strong>Longitude:</strong> ${ipInfo.lon}</p>
      <p><strong>Timezone:</strong> ${ipInfo.timezone}</p>
      <p><strong>ISP:</strong> ${ipInfo.isp}</p>
      <p><strong>AS:</strong> ${ipInfo.as}</p>
   `;
      $('#ip').html(ipInfoHTML);
   }
}

function showError(message) {
   const errorDiv = $('#error');
   errorDiv.text(message);
   errorDiv.removeClass('d-none');

   setTimeout(function() {
      errorDiv.addClass('d-none');
      errorDiv.text('');
   }, 2000);
}

function hideForms(forms) {
   forms.forEach(form => $(`#${form}`).hide());
}

function showForms(forms) {
   forms.forEach(form => $(`#${form}`).show());
}

function resetForms() {
   $('#ipForm, #history').hide();
   $('#loginForm').show();
   $('#username, #password, #ipInput').val('');
   $('#error').text('');
}

function saveUsersToStorage() {
   localStorage.setItem('users', JSON.stringify(users));
}
