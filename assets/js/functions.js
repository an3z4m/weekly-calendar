function generateUniqueId(prefix = 'id') {
    return `${prefix}-${crypto.randomUUID()}`;
}

let insertNewTimeslotFunction = function(event) {
    let insertTimeslotButton = event.target;
    let timeslotController = insertTimeslotButton.closest('.timeslots-controls');

    let timeslotID = timeslotController.getAttribute('linked-timeslot');

    let newTimeslot = allTimeslots[timeslotID];
    
 
    let timeslotInput = timeslotController.querySelector('input');
    let hours = parseInt(timeslotInput.value, 10);

    if(hours <= 0) {
        alert('You must type a positive number of hours');
        return;
    }

    newTimeslot.setHours(hours);

    //let workdayIndex = timeslotController.getAttribute('data-workday-index');
    let workdayIndex = newTimeslot.getWorkdayIndex();
    // let startIndex = timeslotController.getAttribute('data-start-index');

    let workday = workdays[0];

    if(workdayIndex && workdayIndex != -1){
        // Find an available workday
        workday = workdays[workdayIndex];
    }else{
        // Find an available workday
        workday = workdays.find(day => day.addTimeslot(newTimeslot));
    }

    if (workday) {
        setupTimeslotEvents(newTimeslot.element);
        newTimeslot.setWorkdayIndex(workdays.indexOf(workday));
        newTimeslot.element.style.backgroundColor = newTimeslot.isOngoing() ? '#f37f0d' : '';
        newTimeslot.updateVerticalPosition();
        newTimeslot.element.style.display = '';
        // var verticalTimeslotPos = timeslotController.getBoundingClientRect().y - timeslotController.closest('td').getBoundingClientRect().y;
        // newTimeslot.element.style.top = Math.floor(verticalTimeslotPos) + 'px';
        
        insertTimeslotButton.disabled = true;
    } else {
        alert('No available time slots for this duration.');
    }
};

let removetimeslotControllerFunction = function(event) {
    let removeTimeslotButton = event.target;
    let parentCell = removeTimeslotButton.closest('td');
    let removedtimeslotController = removeTimeslotButton.closest('.timeslots-controls');
    if (parentCell.childElementCount > 0) {
        let linkedTimeslotID = removedtimeslotController.getAttribute('linked-timeslot');

        parentCell.removeChild(removedtimeslotController);

        let removedTimeslot = allTimeslots[linkedTimeslotID];
        // remove this timeslot from the old working day
        let oldWorkingDay = workdays[removedTimeslot.getWorkdayIndex()];
        oldWorkingDay.removeTimeslot(removedTimeslot);

        // let linkedTimeslot = document.getElementById(linkedTimeslotID);
        // linkedTimeslot.parentElement.removeChild(removedTimeslot.element);
        removedTimeslot.removeMe();
    }
};