<style>
    <?php include 'assets/css/style.css'; ?>
</style>

<div id="calendar-table">
<table id="schedule-table">
    <thead id="table-head"></thead>
    <tbody></tbody>
</table>
<div class="calendar-buttons" style="display:flex;">
<button class="save-calendar" onclick="update_calendar_via_ajax(saveCalendar())">Save</button>
<button class="add-row" onclick="new Client();">+</button>
</div>
</div>


<?php 
    if (isset($_GET['user_id']) && current_user_can( 'administrator' ) ){
        $user_id = $_GET['user_id'];
    }else{
        $user_id = get_current_user_id(); 
    }
?>

<script>

// load previously saved calendar from database


try{
    var loadedCalendar = JSON.parse('<?php echo get_user_meta( $user_id, "user_calendar", true );
?>');
}catch(err){
    var loadedCalendar = {'':[]};
}


var user_id = '<?php echo $user_id; ?>';


function update_calendar_via_ajax(calendarData){
    // Prepare the FormData
    var formData = new FormData();
    formData.append('action', 'update_calendar');
    formData.append('user_id', user_id);
    formData.append('user_calendar', JSON.stringify(calendarData));

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


<script>
    <?php include 'assets/js/config.js'; ?>
    <?php include 'assets/js/functions.js'; ?>
    <?php include 'assets/js/client.js'; ?>
    <?php include 'assets/js/timeslot.js'; ?>
    <?php include 'assets/js/workday.js'; ?>
    <?php include 'assets/js/main.js'; ?>
    <?php include 'assets/js/init.js'; ?>
</script>

