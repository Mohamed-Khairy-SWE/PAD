"use client"

import { useState } from "react"
import Header from "@/components/header"
import InputPanel from "@/components/input-panel"
import OutputPanel from "@/components/output-panel"
import ResizableDivider from "@/components/resizable-divider"

export interface SDLCData {
  requirements: string
  architecture: string
  testPlan: string
  diagrams: {
    architecture: string
    sequence: string
    er: string
  }
}

export default function Home() {
  const [businessIdea, setBusinessIdea] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sdlcData, setSdlcData] = useState<SDLCData | null>(null)
  const [leftWidth, setLeftWidth] = useState(50)

  const handleGenerate = async () => {
    if (!businessIdea.trim()) return

    setIsLoading(true)

    // Simulate API call with mock data
    setTimeout(() => {
      setSdlcData({
        requirements: `# User Stories\n\n## User Story 1: Browse Products\nAs a user, I want to browse available products so that I can find what I'm looking for.\n\n**Acceptance Criteria:**\n- Display product list with images and descriptions\n- Filter by category\n- Sort by price, rating\n- Pagination for large datasets\n\n## User Story 2: Shopping Cart\nAs a user, I want to add items to cart and checkout so that I can purchase products.\n\n**Acceptance Criteria:**\n- Add/remove items from cart\n- Update quantities\n- View cart summary\n- Apply discount codes`,
        architecture: `# System Architecture\n\n## Overview\nModular e-commerce platform with microservices architecture.\n\n## Components\n\n### Frontend\n- Next.js React application\n- Responsive design with Tailwind CSS\n- State management with React hooks\n\n### Backend Services\n- **API Gateway**: Request routing and authentication\n- **Product Service**: Catalog management\n- **Order Service**: Order processing\n- **Payment Service**: Payment processing\n- **User Service**: Authentication and profiles\n\n### Database\n- PostgreSQL for relational data\n- Redis for caching\n- Elasticsearch for search\n\n### Infrastructure\n- Docker containerization\n- Kubernetes orchestration\n- AWS cloud deployment`,
        testPlan: `# Test Plan\n\n## Unit Tests\n- Component rendering tests\n- Utility function tests\n- API handler tests\n- Coverage target: >80%\n\n## Integration Tests\n- API integration flows\n- Database operations\n- Third-party service integrations\n\n## E2E Tests\n- User purchase workflow\n- Authentication flows\n- Error scenarios\n\n## Performance Tests\n- Load testing with k6\n- Database query optimization\n- API response time monitoring`,
        diagrams: {
          architecture: `graph TB
    Client["Client"]
    Gateway["API Gateway"]
    Product["Product Service"]
    Order["Order Service"]
    Payment["Payment Service"]
    User["User Service"]
    DB[(PostgreSQL)]
    Cache["Redis Cache"]
    
    Client --> Gateway
    Gateway --> Product
    Gateway --> Order
    Gateway --> Payment
    Gateway --> User
    Product --> DB
    Order --> DB
    Payment --> DB
    User --> DB
    Product --> Cache
    Order --> Cache`,
          sequence: `sequenceDiagram
    User->>Client: Browse Products
    Client->>Gateway: GET /products
    Gateway->>Product: Query Catalog
    Product->>DB: Fetch Products
    DB-->>Product: Product Data
    Product-->>Gateway: Response
    Gateway-->>Client: Product List
    Client-->>User: Display Products`,
          er: `erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : includes
    USERS ||--o{ REVIEWS : writes
    PRODUCTS ||--o{ REVIEWS : receives
    PRODUCTS }o--|| CATEGORIES : belongs_to`,
        },
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div style={{ width: `${leftWidth}%` }} className="flex-shrink-0 overflow-auto h-full">
          <InputPanel
            value={businessIdea}
            onChange={setBusinessIdea}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <ResizableDivider onResize={setLeftWidth} />
        <div style={{ width: `${100 - leftWidth}%` }} className="flex-shrink-0 overflow-auto h-full">
          <OutputPanel data={sdlcData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
