from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Grading system for SRM University
GRADE_BOUNDARIES = {
    "O": (91, 100), "A+": (81, 90), "A": (71, 80), "B+": (61, 70),
    "B": (56, 60), "C": (50, 55), "F": (0, 49), "W": (0, 100),
    "*": (0, 100), "Ab": (0, 100), "I": (0, 100)
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/gpa_calculator")
def gpa_calculator():
    return render_template("gpa_calculator.html")

@app.route("/grade_predictor")
def grade_predictor():
    return render_template("grade_predictor.html")

@app.route("/cgpa_calculator")
def cgpa_calculator():
    return render_template("cgpa_calculator.html")

@app.route("/calculate_gpa", methods=["POST"])
def calculate_gpa():
    data = request.get_json(force=True)  # ✅ Ensures JSON is read correctly
    grades = data.get("grades", [])
    credits = data.get("credits", [])

    if not grades or not credits:
        return jsonify({"error": "Grades and credits are required"}), 400

    total_points = 0
    total_credits = 0

    grade_to_points = {"O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0,
                       "W": 0, "*": 0, "Ab": 0, "I": 0}

    for grade, credit in zip(grades, credits):
        if grade in grade_to_points:
            total_points += grade_to_points[grade] * credit
            total_credits += credit

    if total_credits == 0:
        return jsonify({"error": "No valid credits provided"}), 400

    gpa = total_points / total_credits
    return jsonify({"gpa": round(gpa, 2)})

@app.route("/predict_scores", methods=["POST"])
def predict_scores():
    data = request.get_json(force=True)  # ✅ Ensures JSON is read correctly
    internals = data.get("internals", [])
    desired_grades = data.get("desired_grades", [])

    if not internals or not desired_grades:
        return jsonify({"error": "Internals and desired grades are required"}), 400

    predicted_scores = []
    for internal, desired_grade in zip(internals, desired_grades):
        if desired_grade not in GRADE_BOUNDARIES:
            predicted_scores.append("Invalid Grade")
            continue

        min_total, _ = GRADE_BOUNDARIES[desired_grade]
        required_final = min_total - int(internal)
        required_sem_marks = max(0, (required_final / 40) * 75)
        required_sem_marks = min(required_sem_marks, 75)
        predicted_scores.append(f"{round(required_sem_marks, 2)}/75")

    return jsonify({"predicted_scores": predicted_scores})

@app.route('/calculate_cgpa', methods=['POST'])
def calculate_cgpa():
    try:
        data = request.get_json(force=True)  # ✅ Forces JSON parsing
        gpas = data.get("gpas", [])

        if not gpas or not isinstance(gpas, list):
            return jsonify({'error': 'Invalid GPA data provided'}), 400

        # Convert GPA values to float explicitly
        gpas = [float(gpa) for gpa in gpas if isinstance(gpa, (int, float, str)) and gpa]

        if not gpas:  # Check again after conversion
            return jsonify({'error': 'No valid GPA values provided'}), 400

        cgpa = round(sum(gpas) / len(gpas), 2)
        return jsonify({'cgpa': cgpa})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

