# Запит Завдання 7: Доповнення тестів за звітом про покриття (coverage/lcov-report)

## 1. Запит для `applyLatePenalty` та `finalGrade` (непокриті рядки 43, 56, 60 та гілки валідації)
```text
Ось функції applyLatePenalty, finalGrade, toFivePoint та звіт про покриття coverage/lcov-report/index.html.
Не покриті рядки: 43, 56, 60; не покриті гілки:
1) у applyLatePenalty (рядок 42–43): гілка if (!Number.isInteger(daysLate) || daysLate < 0) для від'ємного та дробового daysLate;
2) у finalGrade (рядок 55–56): гілка if (!Array.isArray(thematicGrades) || thematicGrades.length === 0) для порожнього масиву та не-масиву;
3) у finalGrade (рядок 59–60): гілка if (!Number.isInteger(g) || g < 2 || g > 5) для оцінки менше 2, більше 5 та нецілого числа;
4) у toFivePoint (рядок 26–27): підумови typeof score !== "number" та Number.isNaN(score).

Напиши додаткові тести, які покриють саме їх.
Для кожного тесту поясни одним реченням, який сценарій він відтворює.
Очікувані результати – лише з вимог SPEC.md.
```
