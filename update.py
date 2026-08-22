import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix User relations
user_relations = '''
  clientOrders Order[] @relation("ClientOrders")
  masterOrders Order[] @relation("MasterOrders")
  writtenReviews Review[] @relation("WrittenReviews")
  receivedReviews Review[] @relation("ReceivedReviews")

  @@unique([email, phone]) // Allows efficient querying for either
}
'''
content = re.sub(r'  @@unique\(\[email, phone\]\) // Allows efficient querying for either\n}', user_relations, content)

# Fix NotificationType
notification_enum = '''enum NotificationType {
  BRIGADE_INVITE
  SYSTEM
  ORDER_INVITE
  ORDER_UPDATE
  ORDER_ACCEPTED
  ORDER_REJECTED
}'''
content = re.sub(r'enum NotificationType \{\n  BRIGADE_INVITE\n  SYSTEM\n\}', notification_enum, content)

# New Models
new_models = '''
enum OrderStatus {
  PENDING
  ACCEPTED
  REJECTED
  COMPLETED
  CANCELLED
  COMPLETION_REQUESTED
}

model Order {
  id              String      @id @default(uuid())
  clientId        String
  client          User        @relation("ClientOrders", fields: [clientId], references: [id], onDelete: Cascade)
  masterId        String
  master          User        @relation("MasterOrders", fields: [masterId], references: [id], onDelete: Cascade)
  initiatorId     String
  
  description     String
  imageUrl        String?
  startDate       DateTime
  endDate         DateTime
  paymentMethod   String
  price           Float?
  
  address         String?
  latitude        Float?
  longitude       Float?
  
  status          OrderStatus @default(PENDING)
  privacyAccepted Boolean
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  reviews         Review[]
}

model Review {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation("WrittenReviews", fields: [authorId], references: [id], onDelete: Cascade)
  targetId  String
  target    User     @relation("ReceivedReviews", fields: [targetId], references: [id], onDelete: Cascade)
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([orderId, authorId])
}
'''
content += new_models

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
