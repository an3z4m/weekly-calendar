<style>
    <?php include 'assets/css/style.css'; ?>
</style>

<div id="calendar-table">
<table id="schedule-table">
    <thead id="table-head"></thead>
    <tbody></tbody>
</table>
<div class="calendar-buttons" style="display:flex;">
<button class="save-calendar" onclick="saveCalendar()">Save</button>
<button class="add-row" onclick="new Client();">+</button>
</div>
</div>

<script>
    <?php include 'assets/js/functions.js'; ?>
    <?php include 'assets/js/client.js'; ?>
    <?php include 'assets/js/timeslot.js'; ?>
    <?php include 'assets/js/workday.js'; ?>
    <?php include 'assets/js/main.js'; ?>
    <?php include 'assets/js/init.js'; ?>
</script>



<script>

var my_role = '<?php echo $my_role; ?>';
var my_id = '<?php echo $my_id; ?>';


function update_calendar_via_ajax(calendarData){
    // Prepare the FormData
    var formData = new FormData();
    formData.append('action', 'update_calendar');
    formData.append('user_id', my_id);

    // Send the AJAX request using Fetch API
    fetch(ajax_url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the successful response
        if (data.success) {
            showSuccessMessage();
        } else {
            console.error('Error saving calendar:', data);
        }
    })
    .catch(error => {
        console.error('Fetch API request failed:', error);
        // Handle the error
    });
}

</script>