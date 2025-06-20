 'use client';

import { useState } from 'react';
import RatingForm from '@/app/components/RatingForm';
import CourseRatings from '@/app/components/CourseRatings';

export default function RatingsSection({ courseCode }: { courseCode: string }) {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const handleRatingSubmitted = () => {
        setRefreshFlag(prev => !prev); // toggle to trigger refetch
    };

    return (
        <>
            <RatingForm courseCode={courseCode} onRatingSubmitted={handleRatingSubmitted} />
            <CourseRatings courseCode={courseCode} refreshFlag={refreshFlag} />
        </>
    );
}
