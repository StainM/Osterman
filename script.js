// script.js

// Получаем ссылки на элементы
const gameScreen = document.getElementById('gameScreen');
const buttonsContainer = document.getElementById('buttonsContainer');
const carouselContainer = document.getElementById('carouselContainer');

// Создаем контейнер для точек-индикаторов
const indicatorsContainer = document.createElement('div');
indicatorsContainer.className = 'indicatorsContainer';
gameScreen.appendChild(indicatorsContainer);

let currentStepIndex = 0;
let currentAudio = null;

// Переменные для карусели
let currentSlideIndex = 0;
let isSwiping = false;
let startX = 0;
let endX = 0;

// Массив слайдов карусели
const carouselSlidesData = [
    { src: 'images/carousel1.png', alt: 'Изображение 1' },
    { src: 'images/carousel2.png', alt: 'Изображение 2' },
    { src: 'images/carousel3.png', alt: 'Изображение 3' }
];

// Функция для генерации HTML-кода карусели и индикаторов
function generateCarousel() {
    carouselContainer.innerHTML = ''; // Очищаем контейнер перед добавлением слайдов
    indicatorsContainer.innerHTML = ''; // Очищаем контейнер индикаторов
    indicatorsContainer.style.display = 'flex'; // Отображаем индикаторы

    carouselSlidesData.forEach((slideData, index) => {
        // Создаем слайд
        const slide = document.createElement('div');
        slide.className = 'carouselSlide';
        if (index === 0) slide.classList.add('active'); // Делаем первый слайд активным

        const img = document.createElement('img');
        img.src = slideData.src;
        img.alt = slideData.alt;

        slide.appendChild(img);
        carouselContainer.appendChild(slide);

        // Создаем индикатор для каждого слайда
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active'); // Первый индикатор активный
        indicator.addEventListener('click', () => {
            currentSlideIndex = index; // Обновляем индекс текущего слайда
            showSlide(currentSlideIndex); // Показываем слайд при нажатии
        });
        indicatorsContainer.appendChild(indicator);
    });
}

// Функция для перехода к определенному шагу
function goToStep(stepIndex) {
    // Очистка предыдущего состояния
    clearScreen();

    currentStepIndex = stepIndex;
    const step = steps[stepIndex];

    // Проверяем, нужно ли отображать карусель
    if (step.showCarousel) {
        // Показать карусель
        carouselContainer.style.display = 'block';
        indicatorsContainer.style.display = 'flex'; // Показываем индикаторы
        // Генерируем карусель слайдами и индикаторами
        generateCarousel();
    } else {
        // Скрыть карусель и индикаторы
        carouselContainer.style.display = 'none';
        indicatorsContainer.style.display = 'none'; // Скрыть индикаторы
        // Устанавливаем фон, если он задан
        if (step.background) {
            gameScreen.style.backgroundImage = `url('${step.background}')`;
        } else {
            gameScreen.style.backgroundImage = 'none';
        }
    }

    // Запускаем аудио, если есть
    if (step.audio) {
        playAudio(step.audio, step.audioTimeTriggers, step.onEnd);
    } else {
        // Если нет аудио, но есть действие onEnd, выполняем его сразу
        if (step.onEnd) {
            step.onEnd();
        }
    }

    // Отображаем кнопки, если есть
    if (step.buttons) {
        createButtons(step.buttons);
    }
}

// Функция для отображения слайда по индексу
function showSlide(index) {
    const carouselSlides = document.querySelectorAll('.carouselSlide');
    const indicators = document.querySelectorAll('.indicator');

    // Сбрасываем класс 'active' у всех слайдов и индикаторов
    carouselSlides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    // Добавляем класс 'active' к текущему слайду и индикатору
    carouselSlides[index].classList.add('active');
    indicators[index].classList.add('active');
}

// Обработчики событий для свайпов
function handleTouchStart(event) {
    isSwiping = true;
    startX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (!isSwiping) return;
    endX = event.touches[0].clientX;
}

function handleTouchEnd(event) {
    if (!isSwiping) return;
    isSwiping = false;

    const diffX = startX - endX;
    if (Math.abs(diffX) > 50) { // Чувствительность свайпа
        const carouselSlides = document.querySelectorAll('.carouselSlide');
        if (diffX > 0) {
            // Свайп влево (следующий слайд)
            currentSlideIndex = (currentSlideIndex + 1) % carouselSlides.length;
        } else {
            // Свайп вправо (предыдущий слайд)
            currentSlideIndex = (currentSlideIndex - 1 + carouselSlides.length) % carouselSlides.length;
        }
        showSlide(currentSlideIndex);
    }
}

// Функция для воспроизведения аудио
function playAudio(src, timeTriggers, onEnd) {
    // Останавливаем и сбрасываем текущее аудио, если есть
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(src);
    currentAudio.play();

    // Добавляем обработчики времени, если есть
    if (timeTriggers) {
        timeTriggers.forEach(trigger => {
            currentAudio.addEventListener('timeupdate', function onTimeUpdate() {
                if (currentAudio.currentTime >= trigger.time) {
                    trigger.action();
                    currentAudio.removeEventListener('timeupdate', onTimeUpdate);
                }
            });
        });
    }

    // Обработка окончания аудио
    if (onEnd) {
        currentAudio.addEventListener('ended', onEnd);
    }
}

// Функция для создания кнопок
function createButtons(buttonsData) {
    buttonsData.forEach(buttonData => {
        const button = document.createElement('button');
        button.className = 'gameButton';
        button.textContent = buttonData.text;
        button.addEventListener('click', buttonData.action);
        buttonsContainer.appendChild(button);
    });
}

// Функция для очистки кнопок
function clearButtons() {
    buttonsContainer.innerHTML = '';
}

// Функция для очистки экрана
function clearScreen() {
    // Очистка кнопок
    clearButtons();

    // Остановка и сброс аудио
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Скрываем и сбрасываем карусель и индикаторы
    carouselContainer.style.display = 'none';
    indicatorsContainer.style.display = 'none'; // Скрываем индикаторы
    carouselContainer.innerHTML = ''; // Очищаем контейнер карусели
    indicatorsContainer.innerHTML = ''; // Очищаем контейнер индикаторов
    currentSlideIndex = 0;

    // Сбрасываем фон
    gameScreen.style.backgroundImage = 'none';
}

// Обновляем массив шагов
const steps = [
    // Шаг 0: Стартовый экран без карусели
    {
        id: 0,
        showCarousel: false, // Карусель не отображается на Шаге 0
        background: 'images/start_background.jpg',
        audio: null,
        buttons: [
            {
                text: 'Начать',
                action: () => goToStep(1)
            }
        ]
    },
    // Шаг 1: Карусель и воспроизведение intro.mp3
    {
        id: 1,
        showCarousel: true, // Карусель отображается на Шаге 1
        background: null, // Фон не нужен, так как используется карусель
        audio: 'audio/intro.mp3',
        buttons: null,
        audioTimeTriggers: [
            {
                time: 142, // 2 минуты 22 секунды
                action: () => {
                    // Появляются кнопки "О Хранителе" и "Послушать музыку"
                    createButtons([
                        {
                            text: 'О Хранителе',
                            action: () => {
                                if (currentAudio) {
                                    currentAudio.pause();
                                    currentAudio.currentTime = 0;
                                    currentAudio = null;
                                }
                                goToStep(2);
                            }
                        },
                        {
                            text: 'Послушать музыку',
                            action: () => {
                                clearButtons();
                                currentAudio.addEventListener('ended', () => goToStep(2));
                            }
                        }
                    ]);
                }
            }
        ],
        onEnd: () => goToStep(2)
    },
    // Шаг 2: Воспроизведение audio2.mp3, затем переход к следующему шагу
    {
        id: 2,
        showCarousel: false,
        background: 'images/new_background.png',
        audio: 'audio/audio2.mp3',
        buttons: null,
        onEnd: () => goToStep(3)
    },
    // Шаг 3: Выбор между "Софья" и "Татьяна"
    {
        id: 3,
        showCarousel: false,
        background: 'images/character_choice.png',
        audio: null,
        buttons: [
            {
                text: 'Софья',
                action: () => goToStep(4)
            },
            {
                text: 'Татьяна',
                action: () => goToStep(5)
            }
        ]
    },
    // Шаг 4: Путь Софьи
    {
        id: 4,
        showCarousel: false,
        background: 'images/sofia_path.png',
        audio: 'audio/track3.mp3',
        buttons: null,
        onEnd: () => {
            createButtons([
                {
                    text: 'Посмотреть картины Софьи Кувшинниковой',
                    action: () => goToStep(6)
                },
                {
                    text: 'История кружка',
                    action: () => goToStep(7)
                }
            ]);
        }
    },
    // Шаг 5: Путь Татьяны (добавьте аналогичные шаги для Татьяны)
    {
        id: 5,
        showCarousel: false,
        background: 'images/tatiana_path.jpg',
        audio: 'audio/track_tatiana.mp3',
        buttons: null,
        onEnd: () => {
            // Добавьте действия для шага Татьяны
        }
    },
    // Шаг 6: Посмотреть картины Софьи Кувшинниковой
    {
        id: 6,
        showCarousel: false,
        background: 'images/paintings_sofia.png',
        audio: 'audio/track4.mp3',
        buttons: null,
        onEnd: () => {
            createButtons([
                {
                    text: 'Посмотреть портрет Дмитрия Кувшинникова',
                    action: () => goToStep(8)
                },
                {
                    text: 'Посмотреть портрет Исаака Левитана',
                    action: () => goToStep(9)
                }
            ]);
        }
    },
    // Шаг 7: История кружка
    {
        id: 7,
        showCarousel: false,
        background: 'images/circle_history.jpg',
        audio: 'audio/circle_history.mp3',
        buttons: null,
        onEnd: () => goToStep(10)
    },
    // Шаг 8: Посмотреть портрет Дмитрия Кувшинникова
    {
        id: 8,
        showCarousel: false,
        background: 'images/portrait_dmitry.png',
        audio: 'audio/track5.mp3',
        buttons: null,
        onEnd: () => {
            createButtons([
                {
                    text: 'Посмотреть картины',
                    action: () => goToStep(11)
                },
                {
                    text: 'Прочитать воспоминания современников',
                    action: () => goToStep(12)
                }
            ]);
        }
    },
    // Шаг 9: Посмотреть портрет Исаака Левитана
    {
        id: 9,
        showCarousel: false,
        background: 'images/portrait_isaac.jpg',
        audio: 'audio/track_levitan.mp3',
        buttons: null,
        onEnd: () => goToStep(10)
    },
    // Шаг 10: Прочитать воспоминания современников
    {
        id: 10,
        showCarousel: false,
        background: 'images/memoirs.jpg',
        audio: 'audio/memoirs.mp3',
        buttons: null,
        onEnd: () => {
            createButtons([
                {
                    text: 'Прочитать подробнее о ссоре А.Чехова и И.Левитана',
                    action: () => goToStep(13)
                },
                {
                    text: 'Прочитать рассказ Чехова «Попрыгунья»',
                    action: () => goToStep(14)
                },
                {
                    text: 'Слушать другие истории',
                    action: () => goToStep(15)
                }
            ]);
        }
    }
];

// Запускаем игру с нулевого шага
goToStep(0);
