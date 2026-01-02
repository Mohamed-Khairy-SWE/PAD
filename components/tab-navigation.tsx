"use client"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: string[]
}

const tabLabels: Record<string, string> = {
  overview: "Overview",
  requirements: "Requirements",
  architecture: "Architecture",
  diagrams: "Diagrams",
  "test-plan": "Test Plan",
}

export default function TabNavigation({ activeTab, onTabChange, tabs }: TabNavigationProps) {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-sm px-8">
      <div className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pad-tab-button text-foreground/70 hover:text-foreground ${
              activeTab === tab ? "pad-tab-button-active text-accent" : ""
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    </nav>
  )
}
