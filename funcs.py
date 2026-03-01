import random
import math

def sum_list(inputList):
    i = 0
    sum = 0
    while i < len(inputList):
        sum += inputList[i]
        i += 1
    return sum


def amount_of_x_in_list(x, inputList):
    i = 0
    count = 0
    while i < len(inputList):
        if inputList[i] == x:
            count += 1
        i += 1
    return count


def operator_converter(num, reverse=False):
    operatorString = " "

    if not reverse:
        if num == 1:
            operatorString = " + "
        elif num == 2:
            operatorString = " - "
        elif num == 3:
            operatorString = " * "
        elif num == 4:
            operatorString = " / "
    else:
        if num == " + ":
            operatorString = 1
        elif num == " - ":
            operatorString = 2
        elif num == " * ":
            operatorString = 3
        elif num == " / ":
            operatorString = 4
        elif num == "+":
            operatorString = 1
        elif num == "-":
            operatorString = 2
        elif num == "*":
            operatorString = 3
        elif num == "/":
            operatorString = 4
        elif num == " +":
            operatorString = 1
        elif num == " -":
            operatorString = 2
        elif num == " *":
            operatorString = 3
        elif num == " /":
            operatorString = 4
        elif num == "+ ":
            operatorString = 1
        elif num == "- ":
            operatorString = 2
        elif num == "* ":
            operatorString = 3
        elif num == "/ ":
            operatorString = 4

    return operatorString


def difficulty_of_equation(inputList):
    # Translating the input list into individual variables.
    d1, d2, d3, p1, p2, p3, o1, o2, total = inputList

    pow_range = [13, 8, 7, 7, 11, 6, 5, 5, 7, 3, 7, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    dice_powers = []
    for j in [d1, d2, d3]:
        powers = []
        for i in range(pow_range[j]):
            powers.append(math.pow(j, i))
        dice_powers.append(powers)

    listOfDistances = []
    for powers in dice_powers:
        for power in powers:
            listOfDistances.append(abs(power - total))

    # Find shortest distance
    shortest_distance = min(listOfDistances)

    # Function to count occurrences of x in a list
    def amount_of_x_in_list(x, lst):
        return lst.count(x)

    zero_powers = amount_of_x_in_list(0, [p1, p2, p3])
    one_powers = amount_of_x_in_list(1, [p1, p2, p3])

    # Equation values
    equation_values = [math.pow(d1, p1), math.pow(d2, p2), math.pow(d3, p3)]

    # Find largest equation value
    largest_num = max(equation_values)
    largest_num_dist = abs(largest_num - total)

    # Calculate the smallest multiplier
    smallest_multiplier = 0

    if o1 == 3:  
        if equation_values[0] >= equation_values[1]:
            smallest_multiplier = equation_values[1] + math.sqrt(equation_values[0]) / 5
        else:
            smallest_multiplier = equation_values[0] + math.sqrt(equation_values[1]) / 5

    if o2 == 3:
        if equation_values[1] >= equation_values[2]:
            smallest_multiplier = equation_values[2] + math.sqrt(equation_values[1]) / 5
        else:
            smallest_multiplier = equation_values[1] + math.sqrt(equation_values[2]) / 5

    smallest_multiplier = max(smallest_multiplier, -1.2)


    # Difficulty variables
    difficulty_variables = [total, shortest_distance, zero_powers, one_powers, largest_num, largest_num_dist, smallest_multiplier]

    # Difficulty calculation
    new_difficulty = 4 + math.sqrt(difficulty_variables[0]) / 15 + difficulty_variables[1] / 12 - difficulty_variables[2] / 0.75 - difficulty_variables[3] / 1.25 + math.sqrt(difficulty_variables[4]) / 16 + difficulty_variables[5] / 9 + difficulty_variables[6] / 2

    if new_difficulty < 3.2:
        new_difficulty = 3.2

    return round(new_difficulty * 50) / 100


def generate_random_board(highestNum=999):
    boardNums = []

    while len(boardNums) < 36:
        nextNum = random.randint(1, highestNum)
        if amount_of_x_in_list(nextNum, boardNums) == 0:
            boardNums.append(nextNum)

    boardNums.sort()
    return boardNums


def generate_pattern_board(multiple=[6], startingNumber=6):
    boardList = []
    i = 0

    if len(multiple) == 1:
        while i < 36:
            boardList.append(startingNumber + i * multiple[0])
            i += 1
    elif len(multiple) == 2:
        while i < 18:
            boardList.append(startingNumber + i * multiple[0] + i * multiple[1])
            boardList.append(startingNumber + i * multiple[0] + i * multiple[1] + multiple[0])
            i += 1
    elif len(multiple) == 3:
        while i < 12:
            boardList.append(startingNumber + i * multiple[0] + i * multiple[1] + i * multiple[2])
            boardList.append(startingNumber + i * multiple[0] + i * multiple[1] + i * multiple[2] + multiple[0])
            boardList.append(startingNumber + i * multiple[0] + i * multiple[1] + i * multiple[2] + multiple[0] + multiple[1])
            i += 1
    return boardList


def generate_random_dice(minDice=1, maxDice=10, lastMaxDice=20):
    dice = [random.randint(minDice, maxDice), random.randint(minDice, maxDice), random.randint(minDice, lastMaxDice)]
    while amount_of_x_in_list(dice[0], dice) > 2:
        dice = [random.randint(minDice, maxDice), random.randint(minDice, maxDice),
                random.randint(minDice, lastMaxDice)]
    return dice


def calculate_equation(n1, n2, n3, o1, o2):
    if o1 == 1:
        if o2 == 1:
            return n1 + n2 + n3
        if o2 == 2:
            return n1 + n2 - n3
        if o2 == 3:
            return n1 + n2 * n3
        if o2 == 4:
            return n1 + n2 / n3
    if o1 == 2:
        if o2 == 1:
            return n1 - n2 + n3
        if o2 == 2:
            return n1 - n2 - n3
        if o2 == 3:
            return n1 - n2 * n3
        if o2 == 4:
            return n1 - n2 / n3
    if o1 == 3:
        if o2 == 1:
            return n1 * n2 + n3
        if o2 == 2:
            return n1 * n2 - n3
        if o2 == 3:
            return n1 * n2 * n3
        if o2 == 4:
            return n1 * n2 / n3
    if o1 == 4:
        if o2 == 1:
            return n1 / n2 + n3
        if o2 == 2:
            return n1 / n2 - n3
        if o2 == 3:
            return n1 / n2 * n3
        if o2 == 4:
            return n1 / n2 / n3


def cycle(x, y, z, i):
    if i == 0:
        return [x, y, z]
    elif i == 1:
        return [x, z, y]
    elif i == 2:
        return [y, x, z]
    elif i == 3:
        return [y, z, x]
    elif i == 4:
        return [z, y, x]
    elif i == 5:
        return [z, x, y]


def de_power(x):
    if x == 4 or x == 8 or x == 16:
        return 2
    elif x == 9:
        return 3
    else:
        return x


def easiest_solution(inputList):
    dice1 = de_power(inputList[0])
    dice2 = de_power(inputList[1])
    dice3 = de_power(inputList[2])
    total = inputList[3]
    p1 = 0
    p2 = 0
    p3 = 0
    o1 = 1
    o2 = 1

    i = 0

    # List of maximum exponents for each dice roll, starting at 0
    # Limiting the max individual base to 10,000.  Changed this so I can do things like 6^7/3^7
    maxExponents = [1, 1, 12, 7, 6, 6, 10, 5, 4, 4, 7, 3, 7, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

    # List of solutions.  Formatted normally (including the total)
    solutionsList = []

    # Current lowest difficulty achieved by an equation
    smallestDifficulty = pow(10, 10)

    # Current least difficult equation
    easiestEquation = []

    run = True

    while i < 6:

        d1 = cycle(dice1, dice2, dice3, i)[0]
        d2 = cycle(dice1, dice2, dice3, i)[1]
        d3 = cycle(dice1, dice2, dice3, i)[2]

        while run:

            if calculate_equation(pow(d1, p1), pow(d2, p2), pow(d3, p3), o1, o2) == total:
                solutionsList.append([d1, d2, d3, p1, p2, p3, o1, o2, total])
                if difficulty_of_equation([d1, d2, d3, p1, p2, p3, o1, o2, total]) < smallestDifficulty:
                    smallestDifficulty = difficulty_of_equation([d1, d2, d3, p1, p2, p3, o1, o2, total])
                    easiestEquation = [d1, d2, d3, p1, p2, p3, o1, o2, total]
            if p1 < maxExponents[d1]:
                p1 += 1
            elif p2 < maxExponents[d2]:
                p2 += 1
                p1 = 0
            elif p3 < maxExponents[d3]:
                p3 += 1
                p2 = 0
                p1 = 0
            elif o1 < 4:
                o1 += 1
                p3 = 0
                p2 = 0
                p1 = 0
            elif o2 < 4:
                o2 += 1
                o1 = 0
                p3 = 0
                p2 = 0
                p1 = 0
            else:
                run = False
        run = True
        i += 1
        o2 = 0
        o1 = 0
        p3 = 0
        p2 = 0
        p1 = 0

    return easiestEquation


def validate_user_input(firstString, errorString="Error, please enter an integer: "):
    validatedInput = 0
    tryLoop = True

    try:
        validatedInput = int(input(firstString))
    except ValueError:
        while tryLoop:
            tryLoop = False
            try:
                validatedInput = int(input(errorString))
            except ValueError:
                tryLoop = True
    return validatedInput


def validate_between_ranges(minVal, maxVal, userInput):
    while userInput < minVal or userInput > maxVal:
        userInput = validate_user_input("Error, value out of range.  Please re enter value: ")
    return userInput


def print_board(numList):
    i = 0
    while i < 6:
        print(str(numList[6 * i + 0]) + " " + str(numList[6 * i + 1]) + " " + str(numList[6 * i + 2]) + " " +
              str(numList[6 * i + 3]) + " " + str(numList[6 * i + 4]) + " " + str(numList[6 * i + 5]))
        i += 1

    i = 0


def convert_list_of_strings(inputList):
    # Converts a list of string to a list of integers
    outputList = []
    for a in inputList:
        outputList.append(int(a))
    return outputList


def check_with_multiple_strings(main, string1, string2="", string3="", string4="", string5=""):
    if string2 == "":
        string2 = string1
    if string3 == "":
        string3 = string1
    if string4 == "":
        string4 = string1
    if string5 == "":
        string5 = string1
    return main == string1 or main == string2 or main == string3 or main == string4 or main == string5
