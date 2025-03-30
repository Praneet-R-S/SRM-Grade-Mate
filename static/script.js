document.addEventListener("DOMContentLoaded", function () {
    let numSemestersInput = document.getElementById("semesters"); // Match HTML id
    let gpaInputsContainer = document.getElementById("gpaInputs"); 
    let form = document.querySelector("form"); // Target the form element
    let cgpaResult = document.getElementById("cgpaResult");
    
    if (numSemestersInput) {
        numSemestersInput.addEventListener("input", function () {
            let numSemesters = parseInt(this.value) || 0;
            gpaInputsContainer.innerHTML = ""; // Clear previous inputs

            if (numSemesters > 0) {
                for (let i = 1; i <= numSemesters; i++) {
                    let div = document.createElement("div");
                    div.innerHTML = `
                        <label for="gpa${i}">GPA for Semester ${i}:</label>
                        <input type="number" id="gpa${i}" name="gpa" step="0.01" min="0" max="10" required>
                    `;
                    gpaInputsContainer.appendChild(div);
                }
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            let gpaInputs = document.querySelectorAll("#gpaInputs input");
            let gpas = [];

            gpaInputs.forEach(input => {
                let gpaValue = parseFloat(input.value);
                if (!isNaN(gpaValue)) {
                    gpas.push(gpaValue);
                }
            });

            if (gpas.length === 0) {
                cgpaResult.textContent = "Please enter at least one GPA.";
                cgpaResult.style.color = "red";
                return;
            }

            fetch("/calculate_cgpa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gpas: gpas })
            })
            .then(response => response.json())
            .then(data => {
                if (data.cgpa !== undefined) {
                    cgpaResult.innerHTML = `Your CGPA: <strong>${data.cgpa.toFixed(2)}</strong>`;
                    cgpaResult.style.color = "#ffcc00";
                } else {
                    cgpaResult.textContent = "Error calculating CGPA.";
                    cgpaResult.style.color = "red";
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                cgpaResult.textContent = "Failed to connect to the server.";
                cgpaResult.style.color = "red";
            });
        });
    }


    // ✅ GPA CALCULATOR
    let gpaButton = document.getElementById("calculateGPA");
    if (gpaButton) {
        gpaButton.addEventListener("click", function () {
            console.log("GPA Button Clicked");
            let subjects = document.querySelectorAll("#subjects .subject");
            let totalCredits = 0, weightedGradePoints = 0;
            let gradePoints = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0 };

            subjects.forEach(subject => {
                let credits = parseFloat(subject.querySelector("input[name^='credits']").value) || 0;
                let grade = subject.querySelector("select[name^='grade']").value;
                totalCredits += credits;
                weightedGradePoints += (gradePoints[grade] || 0) * credits;
            });

            let gpa = totalCredits > 0 ? (weightedGradePoints / totalCredits).toFixed(2) : "N/A";
            document.getElementById("gpaResult").textContent = "GPA: " + gpa;
        });
    }

    // ✅ ADD / REMOVE SUBJECTS
    let addSubjectButton = document.getElementById("addSubject");
    let removeSubjectButton = document.getElementById("removeSubject");

    if (addSubjectButton) {
        addSubjectButton.addEventListener("click", function () {
            let subjectsContainer = document.getElementById("subjects");
            let count = subjectsContainer.children.length;
            let newSubject = document.createElement("div");
            newSubject.classList.add("subject");
            newSubject.innerHTML = `
                <input type="text" name="subject${count}" placeholder="Subject Name">
                <input type="number" name="credits${count}" placeholder="Credits" min="1">
                <select name="grade${count}">
                    <option value="O">O</option><option value="A+">A+</option>
                    <option value="A">A</option><option value="B+">B+</option>
                    <option value="B">B</option><option value="C">C</option>
                    <option value="F">F</option>
                </select>
            `;
            subjectsContainer.appendChild(newSubject);
        });
    }

    if (removeSubjectButton) {
        removeSubjectButton.addEventListener("click", function () {
            let subjectsContainer = document.getElementById("subjects");
            if (subjectsContainer.children.length > 1) {
                subjectsContainer.removeChild(subjectsContainer.lastChild);
            }
        });
    }

    // ✅ GRADE PREDICTOR
    let predictScoresButton = document.getElementById("predictScores");
    if (predictScoresButton) {
        predictScoresButton.addEventListener("click", function () {
            console.log("Predict Scores Button Clicked");
            let internals = document.querySelectorAll("#internals .row");

            internals.forEach((row, index) => {
                let internalMarks = parseFloat(row.querySelector(`input[name='internal${index}']`)?.value) || 0;
                let desiredGrade = row.querySelector(`select[name='desired_grade${index}']`)?.value;
                let predictedScoreSpan = row.querySelector(`#predictedScore${index}`);

                let gradeBoundaries = { "O": 91, "A+": 81, "A": 71, "B+": 61, "B": 56, "C": 50, "F": 0 };
                let requiredFinalScore = gradeBoundaries[desiredGrade] - internalMarks;
                let requiredOutOf75 = Math.ceil((requiredFinalScore / 40) * 75);

                if (predictedScoreSpan) {
                    if (requiredOutOf75 > 75) {
                        predictedScoreSpan.textContent = "Required: Impossible";
                        predictedScoreSpan.style.color = "red";
                    } else if (requiredOutOf75 <= 0) {
                        predictedScoreSpan.textContent = "Required: 0/75";
                        predictedScoreSpan.style.color = "green";
                    } else {
                        predictedScoreSpan.textContent = `Required: ${requiredOutOf75}/75`;
                        predictedScoreSpan.style.color = "yellow";
                    }
                }
            });
        });
    }
});
