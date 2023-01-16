const meals = document.getElementById('meals')
const favMeal = document.getElementById('fav-meal')
const mealPopup = document.getElementById('meal-popup')
const closePopupBtn = document.getElementById('close-popup')
const mealInfoEl = document.getElementById('meal-info')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')

fetchFavMeals()
getRandomMeal()
async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];


    // console.log(randomMeal)

    addMeal(randomMeal, true);
}
async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}
async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const respData = await resp.json();
    // const search =  resp.apply()
    const meal = await respData.meals;

    return meal;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
    <div class="meal-header"> 
        ${random ? `
        <span class="random">
            Random recipe
        </span>` : ''}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
                <path
                    d="M2 15.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13.5zM8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z" />
            </svg>
        </button>
    </div>
    `;

    const btn = meal.querySelector('.meal-body .fav-btn')
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealFromLS(mealData.idMeal);

            btn.classList.remove('active');
        } else {
            // addMealFav(mealData)
            addMealToLS(mealData.idMeal);
            btn.classList.add('active')
        }
        favMeal.innerHTML = ''
        fetchFavMeals();
    });
    
    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    meals.appendChild(meal);
}

function addMealToLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
    const mealIds = getMealFromLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    const mealIds = getMealFromLS();

    const meals = [];

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);
        meals.push(meal);

        addMealFav(meal);
    }

}

function addMealFav(mealData) {
    // console.log("🚀 ~ file: script.js:103 ~ addMealFav ~ mealData", mealData)
    const meal = document.createElement('li');

    meal.innerHTML = `
    <li><img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
</li>
<button class="clear"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12"><path d="M1.757 10.243a6.001 6.001 0 118.488-8.486 6.001 6.001 0 01-8.488 8.486zM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763z"></path></svg></button>
    `;

    const btn = meal.querySelector('.clear');

    btn.addEventListener('click', () => {
        removeMealFromLS(mealData.idMeal);
        favMeal.innerHTML = ''
        fetchFavMeals();
    })

    favMeal.appendChild(meal);
}

searchBtn.addEventListener('click', async () => {
    meals.innerHTML = '';
    const search = searchTerm.value;
    const meal = await getMealBySearch(search);

    if (meal) {
        meal.forEach(meal => {
            addMeal(meal)
        });
    }
});

closePopupBtn.addEventListener('click', hideIng)

function hideIng() {
    mealPopup.classList.add('hidden')
}
// meals.addEventListener('click', showMealInfo(mealData))

function showMealInfo(mealData) {
    console.log("🚀 ~ file: script.js:160 ~ showMealInfo ~ mealData", mealData)
    mealInfoEl.innerHTML = '';
    const mealInfo = document.createElement('div');

    const ingrediants = [];

    for(let i=1; i<20; i++){
        if(mealData['strIngredient' +i]){
            ingrediants.push(
                `${mealData['strIngredient' +i]} - ${mealData['strMeasure' +i]}`
            );
        } else{
            break;
        }
    }

    mealInfo.innerHTML = `
    <h3>${mealData.strMeal}</h3>
    <img src="${mealData.strMealThumb}" alt="">
    <p>${mealData.strInstructions}</p>
    <h3>Ingrediants</h3>
    <ul>
        ${ingrediants.map(ing => `<li>${ing}</li>`).join('')}
    </ul>
    `;
    mealInfoEl.appendChild(mealInfo);

    mealPopup.classList.remove('hidden');
}