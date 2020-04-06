$(function(){
    // Create common weather types to use later
    var weatherType ={
        'Clear': '<i class="far fa-sun"></i>',
        'Clouds': '<i class="fas fa-cloud-sun"></i>',
        'Rain': '<i class="fas fa-cloud-rain"></i>'
    }

    // Save API key to use often
    var API_KEY = "f3ca986eb585d71ed3e189fdd818b118";
    var currentDay = moment().format("L");
    var searchForCity;
    var currentCity;

    // Check if local storage isn't empty, and reload stored date
    // Calls function after variable restored
    if (localStorage && localStorage.length > 0) {
        searchForCity = localStorage.getItem("searchForCity");
        changeCityInfo();
      }
    

    // API calls for cities by search box
    // Save current city info to use all data for later or make other API calls with long/lat
    $(".search").click(function(){
        searchForCity = $(".search-box").val();
        savePreviousSearch();
        changeCityInfo();        
    });

    //API calls for cities by click search history
    $('body').on('click', '.link', function () {
        searchForCity= $(this).text();
        changeCityInfo();
      });
    
    // Adds all previous searches dynamically under search bar
    // Doesn't check if search exists yet. Maybe make an if condition on function call with a dictionary.
    function savePreviousSearch(){
        $(".searchedCities").prepend(`<button type="button" class="link">${searchForCity}</button></br>`);
    }

    // Main function to change all data for searched city or last searched city
    function changeCityInfo(){
        
        // API call to get current city weather
        // After respone, pulls and sets all data inside relevant tags
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchForCity}&appid=${API_KEY}`).then((response) =>{
            currentCity = response.data;
            console.log(currentCity);


            $(".city-date").text(`${currentCity.name} (${currentDay})`);

            // Checks API response for weather type and appends stored weather type icon html
            if(currentCity.weather[0].main === "Clear"){
                $(".city-date").append(weatherType.Clear);
            }else if(currentCity.weather[0].main === "Clouds"){
                $(".city-date").append(weatherType.Clouds);
            }else if(currentCity.weather[0].main === "Rain"){
                $(".city-date").append(weatherType.Rain);
            }
            
            $(".temperature").text(`Temperature: ${kelvinToFarenheit(currentCity.main.temp)} ${String.fromCharCode(176)}F`);
            $(".humidity").text(`Humidity: ${currentCity.main.humidity}%`);
            $(".wind-speed").text(`Wind Speed: ${currentCity.wind.speed} MPH`);
           
            // Separate functions since it is another API call
            setUVIndex();
            setFiveDayForecast();

            // Empty previous saved city and save new searched city
            localStorage.clear();
            localStorage.setItem('searchForCity', searchForCity);
        });
    }

    // Function to convert API call temp to Farenheight
    // Takes a temperature in kelvin as parameter and return Farenheight rounded to one decimal place
    function kelvinToFarenheit(tempInKelvins){
        return Number.parseFloat((tempInKelvins * (9/5) - 459.67)).toFixed(1);
    }

    // Function to make API call for UV index
    // Use saved currentCity lat and lon for call and return saved variable
    function setUVIndex(){

        // API call for UV Index
        axios.get(`http://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${currentCity.coord.lat}&lon=${currentCity.coord.lon}`).then((response) =>{

        var currentUV = response.data.value;

        // Sets UV Index and background color based on UV Index
        if(currentUV <= 2){
            $(".uv-color").text(`${currentUV}`);
            $(".uv-color").css('background-color', 'LimeGreen')
        }else if(currentUV >= 3 && currentUV <= 5 ){
            $(".uv-color").text(`${currentUV}`);
            $(".uv-color").css('background-color', 'yellow')  
        }else if(currentUV >= 6 && currentUV <= 7 ){
            $(".uv-color").text(`${currentUV}`);
            $(".uv-color").css('background-color', 'orange')
        }else if(currentUV >= 8 && currentUV <= 10 ){
            $(".uv-color").text(`${currentUV}`);
            $(".uv-color").css('background-color', 'red')   
        }else if(currentUV >= 11 ){
            $(".uv-color").text(`${currentUV}`);
            $(".uv-color").css('background-color', 'violet')  
        }
        });
    }

    // Function to make API call for 5 day forecast
    function setFiveDayForecast(){

        // API call for 5 day forecast
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${searchForCity}&appid=${API_KEY}`).then((response) =>{
            var forecast = response.data;

            // Clear all last search forecast cards
            $(".forecast").empty();

            // Loop over in increments of 8 to get new day at 3 pm from forecast list
            for(var i=7; i<forecast.list.length; i=i+8){
                var day = moment(`${forecast.list[i].dt_txt}`).format("L");
                var temp = kelvinToFarenheit(forecast.list[i].main.temp);
                var humidity = forecast.list[i].main.humidity;
                var weather;

                // Checks for weather of forecast day/time 
                if(forecast.list[i].weather[0].main === "Clear"){
                    weather = weatherType.Clear;
                }else if(forecast.list[i].weather[0].main === "Clouds"){
                    weather = weatherType.Clouds;
                }else if(forecast.list[i].weather[0].main === "Rain"){
                    weather = weatherType.Rain;
                }

                // Creates new forecast card with relevant data each loop
                $(".forecast").append(
                    `<div class="card bg-primary text-white mx-2 my-1" style="width: 10rem;">
                    <div class="card-body">
                      <h5 class="card-title">${day}</h5>
                      <h6 class="card-subtitle mb-2">${weather}</h6>
                      <p class="card-text">Temp: ${temp} ${String.fromCharCode(176)}F</p>
                        <p class="card-text">Humidity: ${humidity}%</p>
                    </div>
                  </div>`
                );
            }
        });

    }

});