document.addEventListener('DOMContentLoaded', () => {
  
  const appContent = document.querySelector('#app-content');

  let locationObjects = [];
  let selectedLocation = '';

  // Get all locations then render to app Content
  getLocations()
    .then(() => renderLocationSelect());

  async function getLocations() {
    const url = "https://dev.jaybayudan.com/waitwhile/api/location-status";
    renderLoader();
    return fetch(url)
      .then(res => res.json())
      .then(json => {
        clearLoader();
        locationObjects = json.results.map(location => {
          return {
            id: location.id,
            name: location.name,
            address: location.address,
            isWaitlistOpen: location.isWaitlistOpen,
            numWaiting: location.numWaiting,
            numWaitingGuests: location.numWaitingGuests
          }
        })
        return locationObjects;
      })
      .catch(err => console.log(err))
  }

  function renderLocationSelect(labelText = 'Please choose a location to get started.', locations = locationObjects) {
    const label = document.createElement('label');
    label.setAttribute('for', 'location');
    label.textContent = labelText;

    const select = document.createElement('select');
    select.id = 'select-location';
    const option = document.createElement('option');
    option.textContent = 'Select One'
    option.setAttribute('selected','selected');
    option.value = "";
    select.appendChild(option);
    locations.map(location => {
      const locationOption = document.createElement('option');
      locationOption.value = location.id;
      locationOption.textContent = location.name;
      select.appendChild(locationOption);
    })

    select.addEventListener('change', renderLocationView)

    appContent.appendChild(label);
    appContent.appendChild(select);
  }

  function renderLocationView(e) {
    selectedLocation = e.target.value;
    if (selectedLocation) {
      getLocations()
        .then((res) => {
          const locationData = locationObjects.find(location => location.id === selectedLocation);
          if (locationData.isWaitlistOpen === false) {
            setHeading('Sorry!');
            const p = document.createElement('p');
            p.innerHTML = `It looks like our <b>${locationData.name}</b> location is currently <span class="closed">CLOSED</span>. Please check again later, or...`;
            appContent.appendChild(p);
            renderLocationSelect("Try choosing another location.", res.filter(location => location.isWaitlistOpen === true));
          } else {
            setHeading(locationData.name);
            const h4 = document.createElement('h4');
            h4.textContent = locationData.numWaiting;
            const p = document.createElement('p');
            p.innerHTML = `This location is <span class="open">OPEN</span> and there are`;
            const pFoot = document.createElement('p');
            pFoot.innerHTML = `parties (<b>${locationData.numWaitingGuests}</b> guests) currently waiting`;
            const button = document.createElement('button');
            button.textContent = 'JOIN WAITLIST';
            button.className = 'submit';
            button.addEventListener('click', renderForm)
            appContent.appendChild(p);
            appContent.appendChild(h4);
            appContent.appendChild(pFoot);
            appContent.appendChild(button);
          }
        })
    }
  }

  function renderForm() {
    setHeading('Join the Waitlist');
    flushContent();
    appContent.innerHTML = formHtml;
    const guestForm = document.querySelector('#guest-form');
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Sign In';
    guestForm.addEventListener('submit', handleSubmit)
    guestForm.appendChild(submitButton);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const url = 'https://dev.jaybayudan.com/waitwhile/api/visit-new';
    let formData = new FormData();
      formData.append('location', selectedLocation);
      formData.append('name', document.querySelector('#name').value);
      formData.append('phone', document.querySelector('#phone').value);
      formData.append('partysize', document.querySelector('#party-size').value);

    renderLoader();
    
    fetch(url, { method: 'POST', body: formData })
      .then(res => res.json())
      .then(json => renderSuccessVisit(json[0]))
      .catch(err => console.log(err));
  }

  function renderSuccessVisit(visitData) {
    flushContent();
    setHeading('See you soon!')
    appContent.textContent = `${visitData.firstName}, you've been added to the waitlist as #${visitData.position} in line! The current estimated wait time is ${visitData.estWaitDuration / 60} minutes.`;
  }

  function renderLoader() {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loader';
    flushContent();
    appContent.appendChild(loadingSpinner);
  }
  function clearLoader() {
    const loadingSpinner = document.querySelector('.loader');
    loadingSpinner.remove();
  }

  function setHeading(title) {
    const appHeading = document.querySelector('#app h2');
    appHeading.textContent = title;
  }

  function flushContent() {
    appContent.textContent = '';
  }

  const formHtml = `
  <div>
    <form action="#" method="post" id="guest-form">
      <div>
        <label for="name">Full Name<span class="req">*</span></label>
        <input type="text" id="name" name="name" placeholder="Your Full Name" minlength="6" maxlength="30" required />
      </div>
      <div>
        <label for="phone">Phone<span class="req">*</span></label>
        <input type="tel" id="phone" name="phone" placeholder="Your Phone Number" minlength="10" maxlength="14" pattern="[0-9]+" required />
      </div>
      <div>
        <label for="party-size">Party Size<span class="req">*</span> <input type="tel" id="party-size" name="party-size" minlength="1" maxlength="1" required /></label>
      </div>
    </form>
  </div>
  `;

})