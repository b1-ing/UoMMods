import HeaderBar from "@/app/components/HeaderBar";
import Image from "next/image";
export default function LandingPage() {
  return (
      <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-gray-800">
        <HeaderBar />

          <section className="max-w-5xl mx-auto px-6 py-20 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Plan your course modules with confidence</h2>
              <p className="text-lg text-gray-600 mb-10">
                  UoMMods helps you explore, compare, and plan your university modules — with visual workload charts,
                  prerequisite graphs, and grade history.
              </p>
              <Image src="/planner.png" width={800} height={800} alt="App preview" className="rounded-lg shadow-lg mx-auto w-full max-w-3xl"/>
              <a href="/course-list" className="space-y-8 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                  Launch Modules List
              </a>
          </section>


          <section className="bg-white py-16">
              <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-left">
            <FeatureCard
                title="Interactive Workload Charts"
                description="Easily compare lectures, labs, study hours, and placements with our clean visual breakdown."
                icon="📊"
            />
            <FeatureCard
                title="Grade Insights"
                description="View historical grade distributions to get a sense of how past cohorts performed."
                icon="🎓"
            />
            <FeatureCard
                title="Dependency Graphs"
                description="Understand module prerequisites and postrequisites visually with automatic course maps."
                icon="🔗"
            />
          </div>
        </section>

        <footer className="text-center py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Brendan Ling 
            brendan.ling@student.manchester.ac.uk
        </footer>
      </main>
  );
}

function FeatureCard({
                       title,
                       description,
                       icon,
                     }: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
      <div className="bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
  );
}
