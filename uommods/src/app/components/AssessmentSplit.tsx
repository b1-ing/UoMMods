

type AssessmentSplitProps = {
    exam: number; // e.g., 70
    coursework: number; // e.g., 30
};

export default function AssessmentSplit({ exam, coursework }: AssessmentSplitProps) {
    const total = exam + coursework;
    const examPercentage = (exam / total) * 100;
    const courseworkPercentage = (coursework / total) * 100;

    return (

                <div className="w-full h-6 rounded-full bg-muted overflow-hidden flex">
                    <div
                        className="bg-blue-500 h-full text-xs text-white flex items-center justify-center"
                        style={{ width: `${examPercentage}%` }}
                    >
                        {examPercentage >= 15 && `Exam ${examPercentage.toFixed(0)}%`}
                    </div>
                    <div
                        className="bg-emerald-500 h-full text-xs text-white flex items-center justify-center"
                        style={{ width: `${courseworkPercentage}%` }}
                    >
                        {courseworkPercentage >= 15 && `Coursework ${courseworkPercentage.toFixed(0)}%`}
                    </div>
                </div>

    );
}
