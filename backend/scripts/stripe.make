# Docker image for Stripe CLI
STRIPE_CLI_IMAGE := stripe/stripe-cli:latest

# Docker run command with configuration directory mounted
DOCKER_RUN := docker run --rm -it -v $(CURDIR)/stripe:/root/.config/stripe $(STRIPE_CLI_IMAGE)

stripe.cli:
	@$(DOCKER_RUN)

# Target for authenticating with Stripe
stripe.auth.login:
	@$(DOCKER_RUN) login

stripe.auth.logout:
	@$(DOCKER_RUN) logout


# Target for creating a customer
stripe.customer.create:
	@$(DOCKER_RUN) customers create --email customer@example.com --name "Example Customer"

# Target for creating a charge
stripe.charge.create:
	@$(DOCKER_RUN) charges create --amount 2000 --currency usd --source tok_visa

# Target for listing products and prices
stripe.product.list:
	@$(DOCKER_RUN) products list

stripe.price.list:
	@$(DOCKER_RUN) prices list

stripe.samples.list:
	@$(DOCKER_RUN) samples list

stripe.price.test_create:
	@$(DOCKER_RUN) prices create --unit-amount=599 --currency=usd -d "recurring[interval]"=month -d product="billingsystem_starter"

# Create Starter Package
stripe.package.create_starter:
	@$(DOCKER_RUN) products create --name="Starter" --id="billingsystem_starter"
	@$(DOCKER_RUN) prices create --id="billingsystem_medium_p_m" --unit-amount=599 --currency=usd -d "recurring[interval]"=month -d product="billingsystem_starter"
	@$(DOCKER_RUN) prices create --id="billingsystem_medium_p_y" --unit-amount=6000 --currency=usd -d "recurring[interval]"=year -d product="billingsystem_starter"

# Create Medium Package
stripe.package.create_medium:
	@$(DOCKER_RUN) products create --name="Medium" --id="billingsystem_medium"
	@$(DOCKER_RUN) prices create --id="billingsystem_medium_p_m" --unit-amount=1099 --currency=usd -d "recurring[interval]"=month -d product="billingsystem_m"
	@$(DOCKER_RUN) prices create --id="billingsystem_medium_p_y" --unit-amount=12000 --currency=usd -d "recurring[interval]"=year -d product="billingsystem_m"

# Create Large Package
stripe.package.create_large:
	@$(DOCKER_RUN) products create --name="Large" --id="billingsystem_large"
	@$(DOCKER_RUN) prices create --id="billingsystem_large_p_m" --unit-amount=1599 --currency=usd -d "recurring[interval]"=month -d product="billingsystem_l"
	@$(DOCKER_RUN) prices create --id="billingsystem_large_p_y" --unit-amount=18000 --currency=usd -d "recurring[interval]"=year -d product="billingsystem_l"

# Create and update payment links
stripe.payment_links.create:
	@prices="price_1PvIDmELmvEy1r1bGuxGup3h price_1PvIDgELmvEy1r1bYWHuLZYj price_1PvIDVELmvEy1r1bkRRH3k7C price_1PvIDPELmvEy1r1bzT6XqsWT price_1PvICuELmvEy1r1b5TQzEsul price_1PvICpELmvEy1r1bd6JBOa9c"; \
	for price in $$prices; do \
		$(DOCKER_RUN) payment_links create -d "line_items[0][price]"=$$price -d "line_items[0][quantity]"=1; \
	done

stripe.payment_links.update:
	@prices="price_1PvIDmELmvEy1r1bGuxGup3h price_1PvIDgELmvEy1r1bYWHuLZYj price_1PvIDVELmvEy1r1bkRRH3k7C price_1PvIDPELmvEy1r1bzT6XqsWT price_1PvICuELmvEy1r1b5TQzEsul price_1PvICpELmvEy1r1bd6JBOa9c"; \
	for price in $$prices; do \
		$(DOCKER_RUN) payment_links update -d "line_items[0][price]"=$$price -d "line_items[0][quantity]"=1; \
	done



# Create subscriptions
stripe.subscription.create:
	@$(DOCKER_RUN) subscriptions create --customer=customer_id -d "items[0][price]"=billingsystem_starter

# Composite targets for setup
stripe.package.create_all:
	stripe.package.create_starter stripe.package.create_medium stripe.package.create_large

stripe.full_setup:
	stripe.package.create_all stripe.customer.create stripe.subscription.create


# Target for listening to webhooks and forwarding to local server
stripe.webhooks.listen:
	@$(DOCKER_RUN) listen --forward-to http://172.29.106.185:8080/api/subscription/stripe/webhook


# Create and test webhooks
stripe.webhooks.create:
	@$(DOCKER_RUN) webhook_endpoints create \
	-d "enabled_events[0]"="invoice.payment_succeeded" \
	-d "enabled_events[1]"="invoice.payment_failed" \
	-d "enabled_events[2]"="customer.subscription.created" \
	-d "enabled_events[3]"="customer.subscription.deleted" \
	-d "enabled_events[4]"="customer.subscription.updated" \
	--url="https://api.shohozseller.com/subscription/stripe/webhook"

stripe.webhooks.test:
	# @$(DOCKER_RUN) trigger customer.subscription.created
	@$(DOCKER_RUN) trigger checkout.session.completed
	# @$(DOCKER_RUN) trigger invoice.payment_succeeded
	# @$(DOCKER_RUN) trigger invoice.payment_failed
	# @$(DOCKER_RUN) trigger customer.subscription.deleted
	# @$(DOCKER_RUN) trigger customer.subscription.updated 

# 'cus_RKUau1r1Gqe4QF'