const mealsEl = document.getElementById('meals')
const favMealContainer = document.getElementById('fav-meal')
const mealPopup = document.getElementById('meal-popup')
const closePopupBtn = document.getElementById('close-popup')
const mealInfoEl = document.getElementById('meal-info')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')
const msg = document.querySelector('.msg')



getRandomMeal();

async function getRandomMeal(){
     const resp= await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
     const respData = await resp.json();
     const randomMeal = respData.meals[0];

     addMeal(randomMeal, true)

}

async function getMealById(id){
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id)
    const mealData = await resp.json()
    const meal = mealData.meals[0]
    return meal
}

async function getMealBySerach(term){
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term)
    const respData = await resp.json()
    const meal = respData.meals
    return meal
}

function addMeal(mealData, random = false){
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
    const btn = meal.querySelector(".meal-body .fav-btn")
    btn.addEventListener('click', ()=>{

        if(btn.classList.contains('active')){
            removeMealLs(mealData.idMeal)
            btn.classList.remove('active')
        }else{
            addMealLs(mealData.idMeal)
            btn.classList.add('active')
        }
        fetchFavMeal();
    })
    meal.addEventListener('click', ()=>{
        showRecipeInfo(mealData)
    })
    mealsEl.appendChild(meal)

   
}

function addMealLs(mealId){
 const mealIds = getMealLs()
 localStorage.setItem('mealId', JSON.stringify([...mealIds, mealId]))
}
function removeMealLs(mealId){
     const mealIds = getMealLs()
     localStorage.setItem('mealId',  JSON.stringify(mealIds.filter(id =>id !== mealId)))
}
function getMealLs(){
   const mealIds = JSON.parse(localStorage.getItem('mealId'))
   return mealIds == null?[]:mealIds;
}

async function fetchFavMeal(){
    favMealContainer.innerHTML = ''
    const mealIds = getMealLs()
    const meals = []
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        const meal = await getMealById(mealId)
        meals.push(meal)
        addFavMeal(meal)
    };
  
}

function addFavMeal(mealData){
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
      <span>${mealData.strMeal}</span>
      <button class='clear'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12"><path d="M1.757 10.243a6.001 6.001 0 118.488-8.486 6.001 6.001 0 01-8.488 8.486zM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763z"></path></svg></button>
    `
    const btn = favMeal.querySelector('.clear')
    btn.addEventListener('click', ()=>{
        removeMealLs(mealData.idMeal);
        fetchFavMeal()
    })
    favMeal.addEventListener('click', ()=>{
        showRecipeInfo(mealData)
    })
    favMealContainer.appendChild(favMeal)
}


searchBtn.addEventListener('click', async ()=>{
    mealsEl.innerHTML = ''
   const term = searchTerm.value
const meals = await getMealBySerach(term)
if(meals){
    meals.forEach((meal) => {
        addMeal(meal)
   });
   msg.innerText = ''
}else if(meals === null){
    msg.innerText= 'Not founded try something else!';
}
})

closePopupBtn.addEventListener('click', ()=>{
    mealPopup.classList.add('hidden')
})

function showRecipeInfo(mealInfo){
    mealInfoEl.innerHTML = ""
    const mealEl = document.createElement('div')

    let ingrediants = []

    for (let i = 1; i < 20; i++) {
       if (mealInfo["strIngredient" +i]) {
        ingrediants.push(
            `${mealInfo['strIngredient' +i]} / ${mealInfo['strMeasure' +i]}`
        );
       }
        
    }

    mealEl.innerHTML = `
    <h3>${mealInfo.strMeal}</h3>
    <a href="${mealInfo.strYoutube}" target="_blank">
       <span>${mealInfo.strYoutube}</span>
    </a>
    <img src="${mealInfo.strMealThumb}" alt="">
    <p>${mealInfo.strInstructions}</p>
    <h3>Ingrediants</h3>
    <ul>
    ${ingrediants.map(ing => `<li>${ing}</li>`).join('')}
</ul>
    `
    
    mealInfoEl.appendChild(mealEl)
    mealPopup.classList.remove('hidden')
}