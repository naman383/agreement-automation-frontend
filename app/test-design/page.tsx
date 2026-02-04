'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function TestDesignPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Design System Test</h1>

        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 mb-4">
              Agar ye card blue shadow ke saath dikha raha hai, to components kaam kar rahe hai.
            </p>

            <ProgressBar current={3} total={10} />

            <div className="mt-4 space-x-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
          </CardBody>
        </Card>

        <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900">✅ Agar Ye Dikh Raha Hai:</h3>
          <ul className="mt-2 space-y-1 text-blue-800">
            <li>• Blue card with shadow</li>
            <li>• Progress bar</li>
            <li>• Styled buttons (blue primary, white secondary)</li>
          </ul>
          <p className="mt-3 text-blue-700 font-medium">
            → Components kaam kar rahe hai! Placeholder page me bhi kaam karenge.
          </p>
        </div>

        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-red-900">❌ Agar Plain Text Dikh Raha Hai:</h3>
          <p className="mt-2 text-red-700">
            → Tailwind CSS load nahi ho raha ya components render nahi ho rahe.
          </p>
        </div>
      </div>
    </div>
  );
}
